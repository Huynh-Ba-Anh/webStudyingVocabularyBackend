const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new Schema({
  topicName: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  vocabIds: [{ type: Schema.Types.ObjectId, ref: "Vocabulary" }],
  isDefault: { type: Boolean, default: false },
});

const Topic = mongoose.model("Topic", topicSchema);
module.exports = Topic;
