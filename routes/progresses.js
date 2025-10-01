var express = require("express");
var router = express.Router();
var Progress = require("../models/Progresses");
const { authenticateToken } = require("../middlewares/Auth");
const Vocabulary = require("../models/Vocabularies");
const { creatFillExercise } = require("../helps/fillExercise");
const ExerciseHistory = require("../models/ExerciseHistory");
const mongoose = require("mongoose");
const { equalsIgnoreCase } = require("../helps/equalsIgnoreCase");

/* Tạo Progress mới với nhiều vocab */
router.post("/", authenticateToken, async function (req, res, next) {
  try {
    const userId = req.user.id;

    // Random vocab từ new hoặc forgotten
    const vocab = await Vocabulary.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $in: ["new", "forgotten"] },
        },
      },
      { $sample: { size: 20 } }, // lấy 20 từ
    ]);

    if (!vocab.length)
      return res
        .status(400)
        .json({ message: "Không có từ nào để tạo Progress" });

    const vocabIds = vocab.map((v) => v._id);

    const progressDoc = new Progress({
      user_id: userId,
      vocabulary_id: vocabIds,
    });

    await progressDoc.save();

    res.status(201).json(progressDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Lấy bài tập từ Progress */
router.get(
  "/fill-Exercise/:progressId",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const progressId = req.params.progressId;

      const progress = await Progress.findById(progressId).populate(
        "vocabulary_id"
      );
      if (!progress)
        return res.status(404).json({ message: "Progress not found" });

      const vocabList = progress.vocabulary_id;
      if (!vocabList.length) {
        return res.status(400).json({ message: "No vocab in progress" });
      }

      // Tạo exercise từ vocabList
      const exercises = creatFillExercise(vocabList);

      // Lấy toàn bộ vocab của user (để chọn sai)
      const allVocab = await Vocabulary.find({ userId: userId });

      const exercisesWithOptions = exercises.map((ex) => {
        // Lọc các vocab khác với đáp án đúng
        const wrongChoices = allVocab
          .filter((v) => v.word !== ex.answer) // khác đáp án đúng
          .sort(() => Math.random() - 0.5) // shuffle
          .slice(0, 3); // lấy 3

        let options;

        if (ex.answerType == "word") {
          options = [ex.answer, ...wrongChoices.map((w) => w.word)];
        } else {
          options = [ex.answer, ...wrongChoices.map((w) => w.meaning)];
        }

        // Shuffle options
        const shuffledOptions = options.sort(() => Math.random() - 0.5);

        return {
          questionId: ex.questionId.toString(),
          question: ex.question,
          answer: ex.answer, // đáp án đúng backend dùng để check
          options: shuffledOptions, // frontend hiển thị
        };
      });

      res.status(200).json({ exercises: exercisesWithOptions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* Submit bài tập */
router.post("/submit/:progressId", authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, userAnswer }]
    const { progressId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findById(progressId).populate(
      "vocabulary_id"
    );

    if (!progress)
      return res.status(404).json({ message: "Progress not found" });

    const results = answers.map((ans) => {
      const vocab = progress.vocabulary_id.find(
        (v) => v._id.toString() === ans.questionId
      );

      if (!vocab) {
        return {
          questionId: ans.questionId,
          userAnswer: ans.userAnswer,
          correct: false,
        };
      }

      const isCorrect =
        equalsIgnoreCase(ans.userAnswer, vocab.word) ||
        equalsIgnoreCase(ans.userAnswer, vocab.meaning);
      return {
        question: vocab.word, // hoặc vocab.meaning tùy kiểu bài tập
        answer: vocab.word, // backend dùng để check, frontend không cần hiển thị
        userAnswer: ans.userAnswer,
        correct: isCorrect,
        vocabulary_id: vocab._id,
      };
    });

    const correctCount = results.filter((r) => r.correct).length;

    // Lưu lịch sử
    const history = new ExerciseHistory({
      user_id: userId,
      progress_id: progressId,
      exercises: results,
      correctCount,
      totalCount: results.length,
    });

    await history.save();

    res.status(200).json({ results, correctCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
