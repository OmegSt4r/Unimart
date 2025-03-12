const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", async (req, res) => {
    db.query("SELECT * FROM seller_reviews", (err, sellerReviews) => {
        if (err) {
            console.error("Error fetching seller reviews:", err);
            return res.status(500).json({ error: "Failed to fetch seller reviews" });
        }

        db.query("SELECT * FROM user_reviews", (err, userReviews) => {
            if (err) {
                console.error("Error fetching user reviews:", err);
                return res.status(500).json({ error: "Failed to fetch user reviews" });
            }

            res.json({
                sellerReviews,
                userReviews,
            });
        });
    });
});

// Get seller reviews
router.get("/sellers", (req, res) => {
    const sql = `
        SELECT sr.review_id, sr.comment, sr.rating, u.username AS reviewer, s.company_name AS seller
        FROM seller_reviews sr
        JOIN users u ON sr.review_source = u.user_id
        JOIN sellers s ON sr.review_subject = s.seller_id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
});

// Get user reviews
router.get("/users", (req, res) => {
    const sql = `
        SELECT ur.review_id, ur.comment, ur.rating, reviewer.username AS reviewer, subject.username AS reviewed_user
        FROM user_reviews ur
        JOIN users reviewer ON ur.comment_source = reviewer.user_id
        JOIN users subject ON ur.comment_subject = subject.user_id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
});

// Add a seller review
router.post("/sellers", (req, res) => {
    const { comment, rating, review_source, review_subject } = req.body;
    const sql = "INSERT INTO seller_reviews (comment, rating, review_source, review_subject) VALUES (?, ?, ?, ?)";
    db.query(sql, [comment, rating, review_source, review_subject], (err, result) => {
        if (err) {
            console.error("Error adding review:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Review added successfully", id: result.insertId });
    });
});


// Add a user review
router.post("/users", (req, res) => {
    const { comment, rating, comment_source, comment_subject } = req.body;
    const sql = "INSERT INTO user_reviews (comment, rating, comment_source, comment_subject) VALUES (?, ?, ?, ?)";
    db.query(sql, [comment, rating, comment_source, comment_subject], (err, result) => {
        if (err) {
            console.error("Error adding review:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Review added successfully", id: result.insertId });
    });
});

module.exports = router;
