const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//	Route 1: fetching all notes at /api/notes/fetchallnotes
router.get("/fetchallnotes", fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});

//	Route 2: adding a new note at /api/notes/addnote
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

//  Route 3: updating an existing note at /api/notes/updatenote/:id
router.put("/updatenote/:id", fetchUser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        const newNote = {};
        if (title) newNote.title = title;
        if (description) newNote.description = description;
        if (tag) newNote.tag = tag;

        // check if the note with given id exists or not
        let note = await Note.findById(req.params.id);
        if (!note)
            return res.status(404).send("Note doesn't exist");

        //check if the user updating is same as author of the note
        if (note.user.toString() !== req.user.id)
            return res.status(401).send("Not Allowed");

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        // if the operation is successful and you're sending a response back, Express will automatically set the status code to 200.
        res.json({ note });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});

//  Route 4: deleting an existing note at /api/notes/deletenote/:id
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
    try {

        // check if the note with given id exists or not
        let note = await Note.findById(req.params.id);
        if (!note)
            return res.status(404).send("Note doesn't exist");

        // check if the user owns this note or not
        if (note.user.toString() !== req.user.id)
            return res.status(401).send("Not Allowed");

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
