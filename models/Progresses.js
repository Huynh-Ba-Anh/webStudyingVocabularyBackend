const { Schema, model } = require("mongoose");

const progressSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  vocabulary_id: {
    type: Schema.Types.ObjectId,
    ref: "Vocabulary",
    required: true,
  },

  status: {
    type: String,
    enum: ["new", "learning", "forgotten", "mastered"],
    default: "new",
  },

  correct_count: { type: Number, default: 0 },
  wrong_count: { type: Number, default: 0 },

  last_studied: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Tự động cập nhật updated_at khi save/update
progressSchema.pre("save", function (next) {
  const now = new Date();
  if (this.last_studied && now - this.last_studied > 15 * 24 * 60 * 60 * 1000) {
    this.status = "forgotten";
  }
  this.updated_at = new Date();
  next();
});

const Progress = model("Progress", progressSchema);

module.exports = Progress;
