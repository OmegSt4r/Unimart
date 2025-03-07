const express = require("express");
const router = express.Router();
const db = require("../db");

// Fetch all tags
router.get("/", (req, res) => {
    const sql = "SELECT * FROM tags";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching tags:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});

// Add a new tag
router.post("/", (req, res) => {
    const { tag_name } = req.body;
    const sql = "INSERT INTO tags (tag_name) VALUES (?)";
    db.query(sql, [tag_name], (err, result) => {
        if (err) {
            console.error("Error adding tag:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.status(201).json({ success: true, tag_id: result.insertId });
        }
    });
});

module.exports = router;