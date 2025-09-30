function creatFillExercise(vocab) {
  const shuffled = vocab.sort(() => 0.5 - Math.random());
  const viToX = shuffled.slice(0, 10);
  const xToVi = shuffled.slice(10, 20);

  const fillExercise = [];
  viToX.forEach((item) => {
    fillExercise.push({
      question: item.meaning,
      answer: item.word,
    });
  });
  xToVi.forEach((item) => {
    fillExercise.push({
      question: item.word,
      answer: item.meaning,
    });
  });
  return fillExercise.sort(() => 0.5 - Math.random());
}
exports.creatFillExercise = creatFillExercise;
