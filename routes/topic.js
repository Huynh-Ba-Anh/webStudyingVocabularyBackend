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

module.exports = router;
