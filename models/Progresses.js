const { Schema, model } = require("mongoose");

const progressSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  vocabulary_id: [
    { type: Schema.Types.ObjectId, ref: "Vocabulary", required: true },
  ], // mảng ObjectId
  createdAt: { type: Date, default: Date.now },
});

const Progress = model("Progress", progressSchema);

module.exports = Progress;
