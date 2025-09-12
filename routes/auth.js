const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSettings = require("../constants/jwtSettings");
const User = require("../models/Users");
const bcrypt = require("bcryptjs"); // <- QUAN TRỌNG

router.post("/jwt", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Can't find user" });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  // Demo login, thay bằng DB sau này
  if (isMatch) {
    // Payload hợp lệ
    const payload = {
      sub: email,
      id: user.id,
      role: user.role,
      username: user.userName,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, jwtSettings.SECRET, {
      expiresIn: jwtSettings.ACCESS_EXPIRES,
      audience: jwtSettings.AUDIENCE,
      issuer: jwtSettings.ISSUER,
    });

    const refreshToken = jwt.sign({ sub: email }, jwtSettings.SECRET, {
      expiresIn: jwtSettings.REFRESH_EXPIRES,
    });

    return res.json({
      message: "Login success!",
      email,
      username: user.userName,
      token,
      refreshToken,
    });
  }

  return res.status(401).json({ message: "Login failed!" });
});

module.exports = router;
