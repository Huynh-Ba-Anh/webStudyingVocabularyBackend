var express = require("express");
var router = express.Router();
const Vocabulary = require("../models/Vocabularies");
const { authenticateToken, authorizeRoles } = require("../middlewares/Auth");
const { validateSchema } = require("../validations/validateSchema");
const { VocabularySchema } = require("../validations/schema.yup");
const Progress = require("../models/Progresses");

/* GET home page. */
router.get("/", authenticateToken, authorizeRoles("user"), async (req, res) => {
  try {
    const userId = req.user.id; // id từ JWT payload
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("User ID from token:", userId);
    const vocabulariesList = await Vocabulary.find({ userId }).sort({
      created_at: -1,
    });

    res.status(200).json(vocabulariesList);
  } catch (err) {
    console.error("Error fetching vocabularies:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Add vocabulary
router.post(
  "/",
  authenticateToken,
  validateSchema(VocabularySchema),
  async function (req, res, next) {
    try {
      // gắn userId từ token
      console.log("User ID from token:", req.user.id);
      const vocabulary = new Vocabulary({
        ...req.body,
        userId: req.user.id,
      });
      await vocabulary.save();
      res.status(201).json(vocabulary);
    } catch (err) {
      console.error("Error adding vocabulary:", err);
      res.status(500).send("Internal Server Error");
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
