var express = require("express");
var router = express.Router();
const User = require("../models/Users");
const { validateSchema } = require("../validations/validateSchema");
const { UserSchema } = require("../validations/schema.yup");
const bcrypt = require("bcryptjs");
const { authorizeRoles, authenticateToken } = require("../middlewares/Auth");
const Topic = require("../models/Topic");

router.get("/", async function (req, res, next) {
  try {
    const usersList = await User.find({}, "-password");
    res.status(200).send(usersList);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/infor", authenticateToken, async function (req, res, next) {
  try {
    const userId = req.user.id;
    const userInfo = await User.findById(userId, "-password");
    console.log(userInfo);
    res.status(200).send(userInfo);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/register",
  validateSchema(UserSchema),
  async function (req, res, next) {
    try {
      const user = new User(req.body);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      await user.save();
      console.log(user.id);
      await Topic.create({
        topicName: `Non-Topic of ${user.userName}`,
        userId: user.id,
        isDefault: true,
      });
      const { password, ...userData } = user.toObject();
      res.status(201).json(userData);
    } catch (err) {
      console.error("Error adding user:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put(
  "/:id",
  authenticateToken,
  validateSchema(UserSchema),
  async function (req, res, next) {
    try {
      const userId = req.params.id;
      const userFound = await User.findById(userId);

      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      if (req.user.role == "admin") {
        await User.findByIdAndUpdate(userId, req.body, { new: true });
        return res.status(200).json({ message: "Updated successfully" });
      } else {
        if (req.body.email !== userFound.email) {
          return res.status(400).json({ message: "Email cannot be changed" });
        }

        if (req.body.role == "admin" && userFound.role !== "admin") {
          return res
            .status(403)
            .json({ message: "Forbidden: only admin can assign admin role" });
        }

        if (req.user.sub !== userFound.email) {
          return res
            .status(403)
            .json({ message: "Forbidden: cannot update other user's info" });
        } else {
          await User.findByIdAndUpdate(userId, req.body, { new: true });
          return res.status(200).json({ message: "Updated successfully" });
        }
      }
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async function (req, res, next) {
    try {
      const userId = req.params.id;
      await User.findByIdAndDelete(userId);
      res.status(204).send("Deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
