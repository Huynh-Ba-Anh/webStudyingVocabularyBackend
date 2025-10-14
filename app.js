var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var vocabulariesRouter = require("./routes/vocabularies");
var progressesRouter = require("./routes/progresses");
var topicsRouter = require("./routes/topics");
var authRouter = require("./routes/auth");

var app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://web-studying-vocabulary.vercel.app",
  "https://web-studying-vocabulary-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/vocabularies", vocabulariesRouter);
app.use("/progresses", progressesRouter);
app.use("/users", usersRouter);
app.use("/login", authRouter);
app.use("/topics", topicsRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error("Error handler:", err);
  res.status(err.status || 500).json({
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});



module.exports = app;
