const express = require("express");
const { authenticateToken } = require("../middlewares/Auth");
const Topic = require("../models/Topic");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const topics = await Topic.find({ userId });

    res.status(200).json(topics);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách topic:", error);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách topic" });
  }
});

router.get("/:topicId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicId } = req.params;

    const topic = await Topic.findOne({ _id: topicId, userId }).populate(
      "vocabIds"
    );

    if (!topic) {
      return res.status(404).json({ error: "Không tìm thấy topic" });
    }

    res.status(200).json(topic);
  } catch (error) {
    console.error("Lỗi khi lấy topic:", error);
    res.status(500).json({ error: "Lỗi server khi lấy topic" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicName } = req.body;

    if (!topicName) {
      return res.status(400).json({ error: "Topic name is required" });
    }

    const existing = await Topic.findOne({ topicName, userId });
    if (existing) {
      return res.status(400).json({ error: "Topic already exists" });
    }

    const topic = new Topic({
      topicName,
      userId,
    });

    await topic.save();

    res.status(201).json({ message: "Topic created successfully", topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create topic" });
  }
});

router.put("/:topicId", authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { topicName, vocabIds } = req.body;

    const updatedTopic = await Topic.findByIdAndUpdate(topicId, {
      topicName,
      vocabIds,
    });

    if (!updatedTopic) {
      return res.status(404).json({ error: "Không tìm thấy topic" });
    }

    res.status(200).json({
      message: "Cập nhật topic thành công",
      data: updatedTopic,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật topic:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật topic" });
  }
});

router.delete("/:topicId", authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;

    const deletedTopic = await Topic.findByIdAndDelete(topicId);

    if (!deletedTopic) {
      return res.status(404).json({ error: "Không tìm thấy topic để xóa" });
    }

    res.status(200).json({
      message: "Xóa topic thành công",
      data: deletedTopic,
    });
  } catch (error) {
    console.error("Lỗi khi xóa topic:", error);
    res.status(500).json({ error: "Lỗi server khi xóa topic" });
  }
});

module.exports = router;
