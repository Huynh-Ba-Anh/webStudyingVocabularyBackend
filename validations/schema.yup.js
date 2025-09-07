const yup = require("yup");

const AuthSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
  }),
});

const UserSchema = yup.object({
  body: yup.object({
    userName: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    role: yup.string().oneOf(["user", "admin"]).notRequired().default("user"),
  }),
});

const VocabularySchema = yup.object({
  body: yup.object({
    word: yup.string().required(),
    meaning: yup.string().required(),
    word_type: yup
      .string()
      .oneOf([
        "danh từ",
        "động từ",
        "tính từ い",
        "tính từ な",
        "trạng từ",
        "trợ từ",
        "trợ động từ",
        "định từ",
        "liên từ",
        "thán từ",
      ])
      .required(),
    phonetic: yup.string().required(),
    created_at: yup.date().default(() => new Date()),
    example: yup.string().required(),
    userId: yup.string().required(),
  }),
});

const ProgressSchema = yup.object({
  body: yup.object({
    user_id: yup.string().required(),
    vocabulary_id: yup.string().required(),
    status: yup
      .string()
      .oneOf(["new", "learning", "forgotten", "mastered"])
      .default("new"),
    correct_count: yup.number().min(0).required(),
    wrong_count: yup.number().min(0).required(),
    last_studied: yup.date().default(() => new Date()),
    updated_at: yup.date().default(() => new Date()),
  }),
});


module.exports = {
  AuthSchema,
  UserSchema,
  VocabularySchema,
  ProgressSchema,
};
