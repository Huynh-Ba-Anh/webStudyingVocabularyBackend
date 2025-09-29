var express = require("express");
var router = express.Router();
var Progress = require("../models/Progresses");
const { authenticateToken } = require("../middlewares/Auth");

/* GET learning words */
router.get("/leaning", authenticateToken, async function (req, res, next) {
  try {
    const Id = req.user.id;
    console.log("User ID:", Id);
    if (!Id) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Lấy tất cả các từ mới và từ bị quên
    const newWords = await Progress.find({ Id, status: "new" });
    const oldWords = await Progress.find({ Id, status: "forgotten" });

    // Gộp các từ thành mảng candidates
    let candidates = [...newWords, ...oldWords];

    // Nếu chưa đủ 20 từ, lấy thêm từ "learning" theo thứ tự cập nhật cũ nhất
    const remaining = 20 - candidates.length;
    if (remaining > 0) {
      const learningWords = await Progress.find({ Id, status: "learning" })
        .sort({ updatedAt: 1 })
        .limit(remaining);
      candidates.push(...learningWords);
    }

    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
