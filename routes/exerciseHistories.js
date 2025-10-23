var express = require("express");
const ExerciseHistory = require("../models/ExerciseHistory");
const { authenticateToken } = require("../middlewares/Auth");
var router = express.Router();

router.get("/", authenticateToken, async function (req, res, next) {
    try {
        const userId = req.user.id;
        const histories = await ExerciseHistory.find({ user_id: userId }).populate('exercises.vocabulary_id');
        res.json(histories);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
