var express = require('express');
var router = express.Router();
const User = require('../models/Users');
const { validateSchema } = require('../validations/validateSchema');
const { UserSchema } = require('../validations/schema.yup');
const bcrypt = require('bcryptjs');
const { authorizeRoles, authenticateToken } = require('../middlewares/Auth');


router.get('/', validateSchema(UserSchema), async function (req, res, next) {
    try {
        const usersList = await User.find({}, '-password');
        res.status(200).send(usersList);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Internal Server Error");
    }
});

//welcome to admin
router.get('/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
    res.send("Welcome to the admin panel");
});

//Add users
router.post('/register', validateSchema(UserSchema), authorizeRoles('admin'), async function (req, res, next) {
    try {
        const user = new User(req.body);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        const { password, ...userData } = user.toObject();
        res.status(201).json(userData)
    } catch (err) {
        console.error("Error adding user:", err);
        res.status(500).send("Internal Server Error");
    }
});

//delete user
router.delete('/:id', authenticateToken, async function (req, res, next) {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
