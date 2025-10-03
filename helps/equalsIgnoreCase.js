function normalizeString(str) {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,!?;:]/g, "");
}

function equalsIgnoreCase(userAnswer, vocabWord, vocabMeaning) {
  if (!userAnswer || !userAnswer.trim()) return false;
  const answer = normalizeString(userAnswer);
  const word = normalizeString(vocabWord);
  const meaning = normalizeString(vocabMeaning);

  return answer === word || answer === meaning;
}

exports.equalsIgnoreCase = equalsIgnoreCase;
