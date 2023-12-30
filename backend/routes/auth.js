const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");

const jwt_secret = "bittubhaiyajindabad";

//	Route 1: creating user at /api/auth/createuser
router.post(
    "/createuser",
    [
        body("name", "Enter a valid name").isLength({ min: 3 }),
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password must be atleast 5 characters").isLength({
            min: 5,
        }), // express-validator hai ye
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let user = await User.findOne({ email: req.body.email }); //ye ek promise hai isliye await karna padega
            if (user)
                return res
                    .status(400)
                    .json({ error: "User with this email already exists" });

            const salt = await bcrypt.genSaltSync(10);
            const hash = await bcrypt.hashSync(req.body.password, salt);

            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: hash,
            });

            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, jwt_secret);
            res.json({ authToken });
        } catch (err) {
            console.error(err.message); //500 status application error ka hota hai
            res.status(500).send({ error: err.message });
        }
    }
);

//	Route 2: authenticating the user at /api/auth/login - no login required
router.post(
    "/login",
    [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password must be atleast 5 characters").isLength({ min: 5 }), // express-validator hai ye
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            let user = await User.findOne({ email });
            if (!user) res.status(400).json({ error: "Please login with correct credentials" });

            const passwordCompare = bcrypt.compareSync(password, user.password);
            if (!passwordCompare)
                res.status(400).json("Please login with correct credentials");

            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, jwt_secret);
            res.json({ authToken });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Internal server error"); //500 status application error ka hota hai
        }
    }
);

// ROute 3: Get user details. /api/auth/getuser
router.post(
    "/getuser",
    fetchUser,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user);
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Internal server error");
        }
    }
);

module.exports = router;
