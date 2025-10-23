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

const VocabularyImportSchema = yup.object({
  word: yup.string().required("Word là bắt buộc"),
  meaning: yup.string().required("Meaning là bắt buộc"),
  word_type: yup.string(),
  phonetic: yup.string(),
  inforMore: yup.string(),
  example: yup.string(),
  created_at: yup.date().default(() => new Date()),
  userId: yup.string(),
});

const VocabularySchema = yup.object({
  body: yup.object({
    word: yup.string().required(),
    meaning: yup.string().required(),
    word_type: yup.string(),
    phonetic: yup.string(),
    inforMore: yup.string(),
    created_at: yup.date().default(() => new Date()),
    example: yup.string(),
    userId: yup.string(),
  }),
});

const ProgressSchema = yup.object({
  body: yup.object({
    user_id: yup.string().required(),
    vocabulary_id: yup.string(),
    createdAt: yup.date().default(() => new Date()),
  }),
});


module.exports = {
  AuthSchema,
  UserSchema,
  VocabularySchema,
  ProgressSchema,
  VocabularyImportSchema,
};
