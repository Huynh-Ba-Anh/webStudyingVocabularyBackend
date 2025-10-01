function normalizeString(str) {
  if (!str) return "";
  return str
    .trim() // loại bỏ khoảng trắng đầu/cuối
    .toLowerCase() // viết thường
    .normalize("NFKC") // chuẩn hóa unicode (full-width → half-width)
    .replace(/[.,!?;:]/g, ""); // bỏ dấu câu cơ bản
}

function equalsIgnoreCase(userAnswer, vocabWord, vocabMeaning) {
  if (!userAnswer || !userAnswer.trim()) return false;
  const answer = normalizeString(userAnswer);
  const word = normalizeString(vocabWord);
  const meaning = normalizeString(vocabMeaning);

  return answer === word || answer === meaning;
}

exports.equalsIgnoreCase = equalsIgnoreCase;
