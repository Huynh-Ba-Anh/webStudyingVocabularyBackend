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

    res
      .status(201)
      .json({ message: "Progress created", progress: progressDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Lấy bài tập từ Progress */
router.get(
  "/fill-Exercise/:progressId",
  authenticateToken,
  async function (req, res) {
    try {
      const progressId = req.params.progressId;

      const progress = await Progress.findById(progressId).populate(
        "vocabulary_id"
      );

      if (!progress)
        return res.status(404).json({ message: "Progress not found" });

      const vocabList = progress.vocabulary_id;

      const exercises = creatFillExercise(vocabList);

      // Mỗi exercise có questionId = _id của vocab
      const exercisesWithId = exercises.map((ex) => ({
        questionId: ex._id || ex._id?.toString(),
        question: ex.question,
        answer: ex.answer, // backend biết, frontend không cần hiển thị answer
      }));

      res.status(200).json({ exercises: exercisesWithId });
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
