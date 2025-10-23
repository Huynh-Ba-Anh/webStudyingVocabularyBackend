// helps/resetProcessWord.js
const cron = require("node-cron");
const Vocabulary = require("../models/Vocabularies");

const resetProcessWord = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const halfMonthAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

            const result = await Vocabulary.updateMany(
                { last_studied: { $lt: halfMonthAgo }, status: "mastered", status: "learning" },
                { $set: { status: "forgotten" } }
            );

            console.log(
                `✅ Reset process done: ${result.modifiedCount} words updated`
            );
        } catch (error) {
            console.error("❌ Error in resetProcessWord:", error);
        }
    });
};

module.exports = resetProcessWord;
