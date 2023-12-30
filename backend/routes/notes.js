const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

router.get("/fetchallnotes", fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post(
    "/addnote",
    fetchUser,
    [
        body("title", "Enter a valid title").isLength({ min: 3 }),
        body(
            "description",
            "Description must be atleast 5 characters"
        ).isLength({ min: 5 }), // express-validator hai ye
    ],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() });
            }

            const note = new Note({
                title,
                description,
                tag,
                user: req.user.id,
            });

            const savedNote = await note.save();

            res.json(savedNote);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Internal Server Error");
        }
    }
);

module.exports = router;
