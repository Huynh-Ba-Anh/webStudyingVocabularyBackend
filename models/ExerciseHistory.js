const { Schema, model } = require("mongoose");

const exerciseHistorySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  progress_id: { type: Schema.Types.ObjectId, ref: "Progress", required: true },
  exercises: [
    {
      question: String,
      answer: String,
      userAnswer: String,
      correct: Boolean,
      vocabulary_id: { type: Schema.Types.ObjectId, ref: "Vocabulary" },
    },
  ],
  correctCount: Number,
  totalCount: Number,
  createdAt: { type: Date, default: Date.now },
});

const ExerciseHistory = model("ExerciseHistory", exerciseHistorySchema);
module.exports = ExerciseHistory;
