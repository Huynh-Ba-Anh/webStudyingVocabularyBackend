var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

// Connect database to mongoose
const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://DevTea:Baanh2003@studyingvocab.u7ailhs.mongodb.net/Main"
  )
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var vocabulariesRouter = require("./routes/vocabularies");
var progressesRouter = require("./routes/progresses");
var authRouter = require("./routes/auth");

var app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:5173", // domain FE
    credentials: true, // cho phép gửi cookie/token nếu cần
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
