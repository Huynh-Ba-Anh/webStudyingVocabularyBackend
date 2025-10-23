const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const vocabularySchema = new Schema({
  word: { type: String, required: true, unique: true },
  meaning: { type: String, required: true },
  word_type: { type: String },
  phonetic: { type: String },
  inforMore: { type: String },
  example: { type: String },
  status: {
    type: String,
    enum: ["new", "learning", "forgotten", "mastered"],
    default: "new",
  },
  correct_count: { type: Number, default: 0 },
  wrong_count: { type: Number, default: 0 },
  last_studied: { type: Date, default: null },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Vocabulary = mongoose.model("Vocabulary", vocabularySchema);
module.exports = Vocabulary;

