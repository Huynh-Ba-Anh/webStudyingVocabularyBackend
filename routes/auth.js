const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSettings = require('../constants/jwtSettings');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');  // <- QUAN TRỌNG


router.post('/jwt', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).json({ message: 'Login failed!' });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    // Demo login, thay bằng DB sau này
    if (isMatch) {
        // Payload hợp lệ
        const payload = {
            sub: username,
            role: user.role,
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(payload, jwtSettings.SECRET, {
            expiresIn: jwtSettings.ACCESS_EXPIRES,
            audience: jwtSettings.AUDIENCE,
            issuer: jwtSettings.ISSUER,
        });

        const refreshToken = jwt.sign({ sub: username }, jwtSettings.SECRET, {
            expiresIn: jwtSettings.REFRESH_EXPIRES
        });

        return res.json({
            message: 'Login success!',
            username,
            token,
            refreshToken
        });
    }

    return res.status(401).json({ message: 'Login failed!' });
});

module.exports = router;
