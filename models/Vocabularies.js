const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vocabularySchema = new Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  word_type: {
    type: String,
    enum: [
      "danh từ",
      "động từ",
      "tính từ い",
      "tính từ な",
      "trạng từ",
      "trợ từ",
      "trợ động từ",
      "định từ",
      "liên từ",
      "thán từ",
    ],
    required: true,
  },
  phonetic: { type: String, required: true },
  inforMore: { type: String },
  example: { type: String, required: true },
  status: {
    type: String,
    enum: ["new", "learning", "forgotten", "mastered"],
    default: "new",
  },
  correct_count: { type: Number, default: 0 },
  wrong_count: { type: Number, default: 0 },
  last_studied: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Vocabulary = mongoose.model("Vocabulary", vocabularySchema);
module.exports = Vocabulary;
