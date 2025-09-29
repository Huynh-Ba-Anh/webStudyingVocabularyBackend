var express = require("express");
var router = express.Router();
const Vocabulary = require("../models/Vocabularies");
const { authenticateToken, authorizeRoles } = require("../middlewares/Auth");
const { use, authenticate } = require("passport");
const { validateSchema } = require("../validations/validateSchema");
const { VocabularySchema } = require("../validations/schema.yup");

/* GET home page. */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("user"),
  async function (req, res, next) {
    try {
      const UserId = req.user.id;
      const vocabulariesList = await Vocabulary.find({ userId: UserId })
        .populate("userId")
        .sort({ created_at: -1 });
      res.status(200).send(vocabulariesList);
    } catch (err) {
      res.status(200).send(vocabulariesList);
      console.error("Error fetching vocabularies:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Add vocabulary
const mongoose = require("mongoose");

router.post(
  "/",
  authenticateToken,
  validateSchema(VocabularySchema),
  async function (req, res, next) {
    try {
      // tạo vocabulary
      const vocabulary = new Vocabulary({
        ...req.body,
        userId: req.user.id, // string từ token
      });

      await vocabulary.save();

      // tạo progress cho user với status "new"
      const progress = new Progress({
        user_id: new mongoose.Types.ObjectId(req.user.id), // bắt buộc 'new'
        vocabulary_id: vocabulary._id,
        status: "new",
      });
      await progress.save();

      res.status(201).json({ vocabulary, progress });
    } catch (err) {
      console.error("Error adding vocabulary:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Update vocabulary
router.put(
  "/:vocabId",
  authenticateToken,
  validateSchema(VocabularySchema),
  async function (req, res, next) {
    try {
      const vocabId = req.params.vocabId;
      await Vocabulary.findByIdAndUpdate(vocabId, req.body, { new: true });
      res.status(200).json({ message: "Updated successfully" });
    } catch (err) {
      console.error("Error update vocabulary:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Delete vocabulary
router.delete("/:vocabId", authenticateToken, async function (req, res, next) {
  try {
    const vocabId = req.params.vocabId;
    await Vocabulary.findByIdAndDelete(vocabId);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error Delete vocabulary:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
