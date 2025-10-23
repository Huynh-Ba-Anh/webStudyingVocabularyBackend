var express = require("express");
var router = express.Router();
var Progress = require("../models/Progresses");
const { authenticateToken } = require("../middlewares/Auth");
const Vocabulary = require("../models/Vocabularies");
const { creatFillExercise } = require("../helps/fillExercise");
const ExerciseHistory = require("../models/ExerciseHistory");
const mongoose = require("mongoose");
const { equalsIgnoreCase } = require("../helps/equalsIgnoreCase");
const e = require("express");

router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const vocab = await Vocabulary.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $in: ["forgotten", "learning", "new"] },
        },
      },
      {
        $addFields: {
          priority: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "forgotten"] }, then: 3 },
                { case: { $eq: ["$status", "learning"] }, then: 2 },
                { case: { $eq: ["$status", "new"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $addFields: { score: { $add: ["$priority"] } } },
      { $sort: { score: -1 } },
      { $limit: 20 },
    ]);

    if (!vocab.length) {
      return res.status(400).json({ message: "Không có từ nào để tạo Progress" });
    }

    const vocabIds = vocab.map((v) => v._id);

    const progressDoc = await Progress.create({
      user_id: userId,
      vocabulary_id: vocabIds,
    });

    res.status(201).json(progressDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get(
  "/fill-Exercise/:progressId",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const progressId = req.params.progressId;
      const typeExercise = req.query.typeExercise;

      const progress = await Progress.findById(progressId).populate(
        "vocabulary_id"
      );
      if (!progress)
        return res.status(404).json({ message: "Progress not found" });

      const vocabList = progress.vocabulary_id;
      if (!vocabList.length) {
        return res.status(400).json({ message: "No vocab in progress" });
      }
      const exercises = creatFillExercise(vocabList, type = typeExercise);

      if (typeExercise === "writing") {
        console.log(exercises);
        return res.status(200).json(exercises);
      } else {

        const allVocab = await Vocabulary.find({ userId: userId }).limit(60);

        const exercisesWithOptions = exercises.map((ex) => {
          const wrongChoices = allVocab
            .filter((v) => v.word !== ex.answer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          let options;

          if (ex.answerType == "word") {
            options = [ex.answer, ...wrongChoices.map((w) => w.word)];
          } else {
            options = [ex.answer, ...wrongChoices.map((w) => w.meaning)];
          }

          const shuffledOptions = options.sort(() => Math.random() - 0.5);

          return {
            questionId: ex.questionId.toString(),
            question: ex.question,
            answer: ex.answer,
            options: shuffledOptions,
          };
        });
        return res.status(200).json({ exercises: exercisesWithOptions });
      }

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.post("/submit/:progressId", authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
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
        equalsIgnoreCase(ans.userAnswer, vocab.word, vocab.meaning);

      if (isCorrect) {
        vocab.correct_count += 1;
      } else {
        vocab.wrong_count += 1;
      }
      vocab.save();
      return {
        question: vocab.meaning,
        answer: vocab.word,
        userAnswer: ans.userAnswer,
        correct: isCorrect,
        vocabulary_id: vocab._id,
      };
    });

    const correctCount = results.filter((r) => r.correct).length;

    const history = new ExerciseHistory({
      user_id: userId,
      progress_id: progressId,
      exercises: results,
      correctCount,
      totalCount: results.length,
    });

    await history.save();

    res.status(200).json({ results, correctCount });

    const updateResult = await Vocabulary.updateMany(
      { _id: { $in: progress.vocabulary_id } },
      [
        {
          $set: {
            last_studied: new Date(),
            status: {
              $cond: [
                { $gte: ["$correct_count", 3] },
                "mastered",
                {
                  $cond: [
                    { $eq: ["$status", "new"] },
                    "learning",
                    "$status"
                  ]
                }
              ]
            },
            correct_count: {
              $cond: [
                { $gte: ["$correct_count", 3] },
                0,
                "$correct_count"
              ]
            }
          }
        }
      ]
    );


    console.log("updateResult:", updateResult);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
