const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => { // GET /reviews
    const reviewId = req.query.reviewId;
    let sql = `
        SELECT r.*, s.company_name AS seller_name
        FROM reviews r
        JOIN sellers s ON r.seller_id = s.seller_id
        JOIN buyers b ON r.buyer_id = b.buyer_id
    `;
    const params = [];
    if (reviewId) {
        sql += ' WHERE r.review_id = ?';
        params.push(reviewId);
    }
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
});

// router.post("/", (req, res) => {
//     const { reviewId, authorId, rating, content } = req.body;
//     const sql = "INSERT INTO reviews (product_id, author_id, rating, content) VALUES (?, ?, ?, ?)";
//     db.query(sql, [reviewId, authorId, rating, content], (err, result) => {
//         if (err) {
//             console.error("Error adding review:", err);
//             res.status(500).json({ error: "Database error" });
//         } else {
//             res.status(201).json({ message: "Review added successfully", id: result.insertId });
//         }
//     });
// });

// router.delete("/:id", (req, res) => {
//     const reviewId = req.params.id;
//     const sql = "DELETE FROM reviews WHERE review_id = ?";
//     db.query(sql, [reviewId], (err, result) => {
//         if (err) {
//             console.error("Error deleting review:", err);
//             res.status(500).json({ error: "Database error" });
//         } else {
//             res.status(200).json({ message: "Review deleted successfully" });
//         }
//     });
// });

module.exports = router;
