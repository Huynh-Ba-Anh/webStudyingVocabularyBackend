var express = require("express");
var router = express.Router();
const Vocabulary = require("../models/Vocabularies");
const { authenticateToken, authorizeRoles } = require("../middlewares/Auth");
const { validateSchema } = require("../validations/validateSchema");
const {
  VocabularySchema,
  VocabularyImportSchema,
} = require("../validations/schema.yup");
const Topic = require("../models/Topic");

router.get("", authenticateToken, authorizeRoles("user"), async (req, res) => {
  try {
    const userId = req.user.id;

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

router.get(
  "/newVocab",
  authenticateToken,
  authorizeRoles("user"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const vocabulariesList = await Vocabulary.find({
        userId,
      }).sort({ created_at: -1 }).limit(12);

      res.status(200).json(vocabulariesList);
    } catch (err) {
      console.error("Error fetching vocabularies:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post(
  "/:topicId?",
  authenticateToken,
  validateSchema(VocabularySchema),
  async function (req, res, next) {
    try {
      let topicId = req.params.topicId;

      if (!topicId) {
        const defaultTopic = await Topic.findOne({ isDefault: true });
        console.log(defaultTopic)

        if (!defaultTopic) {
          return res.status(400).json({ message: "No default topic found" });
        }
        topicId = defaultTopic._id;
      }
      console.log("Topic ID for new vocab:", topicId);
      const vocabulary = new Vocabulary({
        ...req.body,
        userId: req.user.id,
      });
      await vocabulary.save();

      const topic = await Topic.findById(topicId);
      if (topic) {
        topic.vocabIds.push(vocabulary._id);
        await topic.save();
      }

      console.log(topic);

      res.status(201).json(vocabulary);
    } catch (err) {
      console.error("Error adding vocabulary:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post("/import/:topicId?", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const vocabList = req.body;
    let topicId = req.params.topicId;

    if (!topicId) {
      const defaultTopic = await Topic.findOne({ isDefault: true });
      if (!defaultTopic) {
        return res.status(400).json({ message: "No default topic found" });
      }
      topicId = defaultTopic._id;
    }

    if (!Array.isArray(vocabList) || vocabList.length === 0) {
      return res.status(400).json({
        message: "File Excel rỗng hoặc dữ liệu không hợp lệ",
      });
    }

    const validatedVocab = [];
    const errors = [];

    for (let index = 0; index < vocabList.length; index++) {
      try {
        const validItem = await VocabularyImportSchema.validate({
          word: vocabList[index].Word,
          meaning: vocabList[index].Meaning,
          word_type: vocabList[index]["Word Type"],
          phonetic: vocabList[index].Phonetic,
          inforMore: vocabList[index].InforMore || "",
          example: vocabList[index].Example,
          created_at: new Date(),
          userId,
        });
        validatedVocab.push(validItem);
      } catch (error) {
        errors.push({ row: index + 2, message: error.message });
      }
    }

    let insertedVocabs = [];
    if (validatedVocab.length > 0) {
      insertedVocabs = await Vocabulary.insertMany(validatedVocab);
    }

    if (topicId && insertedVocabs.length > 0) {
      await Topic.findByIdAndUpdate(
        topicId,
        {
          $addToSet: { vocabIds: { $each: insertedVocabs.map((v) => v._id) } },
        },
        { new: true }
      );
    }

    res.json({
      message: "Import hoàn tất",
      successCount: insertedVocabs.length,
      errorCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

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
