const e = require("express");

function creatFillExercise(vocab, type) {
  const fillExercise = [];

  if (type == "noun") {
    const shuffled = vocab.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20);

    selected.forEach((item) => {
      fillExercise.push({
        questionId: item._id.toString(),
        question: item.meaning,
        answer: item.word,
        answerType: "word",
      })
    })
  } else {
    const shuffled = vocab.sort(() => 0.5 - Math.random());
    const viToX = shuffled.slice(0, 10);
    const xToVi = shuffled.slice(10, 20);

    viToX.forEach((item) => {
      fillExercise.push({
        questionId: item._id.toString(),
        question: item.meaning,
        answer: item.word,
        answerType: "word",
      });
    });
    xToVi.forEach((item) => {
      fillExercise.push({
        questionId: item._id.toString(),
        question: item.word,
        answer: item.meaning,
        answerType: "meaning",
      });
    });
  }
  return fillExercise.sort(() => 0.5 - Math.random());
}
exports.creatFillExercise = creatFillExercise;
