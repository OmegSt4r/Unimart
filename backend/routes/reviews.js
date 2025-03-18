const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all reviews
router.get("/", async (req, res) => {
    const sellerReviewsQuery = `
        SELECT sr.review_id, sr.comment, sr.rating, 
               u.username AS reviewer, 
               s.company_name AS seller
        FROM seller_reviews sr
        JOIN users u ON sr.review_source = u.user_id
        JOIN sellers s ON sr.review_subject = s.seller_id
    `;

    const userReviewsQuery = `
        SELECT ur.review_id, ur.comment, ur.rating, 
               reviewer.username AS reviewer, 
               subject.username AS reviewed_user
        FROM user_reviews ur
        JOIN users reviewer ON ur.comment_source = reviewer.user_id
        JOIN users subject ON ur.comment_subject = subject.user_id
    `;

    try {
        const [sellerReviews] = await db.promise().query(sellerReviewsQuery);
        const [userReviews] = await db.promise().query(userReviewsQuery);

        res.json({ sellerReviews, userReviews });
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});


// Get seller reviews with pagination
router.get("/sellers", (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const sql = `
        SELECT sr.review_id, sr.comment, sr.rating, 
               u.username AS reviewer, 
               s.company_name AS seller
        FROM seller_reviews sr
        JOIN users u ON sr.review_source = u.user_id
        JOIN sellers s ON sr.review_subject = s.seller_id
        LIMIT ? OFFSET ?
    `;

    db.query(sql, [parseInt(limit), parseInt(offset)], (err, results) => {
        if (err) {
            console.error("Error fetching seller reviews:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Get user reviews with pagination and filtering
router.get("/users", (req, res) => {
    const { page = 1, limit = 10, user_id } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
       SELECT ur.review_id, ur.comment, ur.rating, 
               reviewer.username AS reviewer, 
               subject.username AS reviewed_user
        FROM user_reviews ur
        JOIN users reviewer ON ur.comment_source = reviewer.user_id
        JOIN users subject ON ur.comment_subject = subject.user_id
    `;

    const params = [];
    if (user_id) {
        sql += " WHERE ur.comment_subject = ?";
        params.push(user_id);
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching user reviews:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Add a seller review
router.post("/sellers", (req, res) => {
    const { comment, rating, review_source, review_subject } = req.body;

    if (!comment || !rating || !review_source || !review_subject) {
        return res.status(400).json({ error: "All fields are required." });
    }

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

    if (!comment || !rating || !comment_source || !comment_subject) {
        return res.status(400).json({ error: "All fields are required." });
    }

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