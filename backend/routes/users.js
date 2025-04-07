const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username) VALUES (?)";
    db.query(sql, [username], (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const userId = result.insertId;
      const sqlInfo = "INSERT INTO user_info (user_id, u_password, email) VALUES (?, ?, ?)";
      db.query(sqlInfo, [userId, hashedPassword, email], (err) => {
        if (err) {
          console.error("Error registering user info:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/:userId/register-seller", (req, res) => {
  const userId = req.params.userId;
  const { company_name } = req.body;

  const sql = "INSERT INTO sellers (company_name, owner_id) VALUES (?, ?)";
  db.query(sql, [company_name, userId], (err, result) => {
    if (err) {
      console.error("Error registering seller:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Seller registration successful" });
  });
});
// User login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT u.user_id, u.username, ui.u_password, ui.email, ui.wallet_balance 
    FROM users u 
    JOIN user_info ui ON u.user_id = ui.user_id 
    WHERE u.username = ?
  `;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const storedPassword = user.u_password;

    // Check if password is stored in plain text (bcrypt hashes start with "$2b$")
    const isHashed = storedPassword.startsWith("$2b$");

    if (!isHashed) {
      if (password === storedPassword) {
        // If plain text password matches, hash it and update in database
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateSQL = "UPDATE user_info SET u_password = ? WHERE user_id = ?";

        db.query(updateSQL, [hashedPassword, user.user_id], (updateErr) => {
          if (updateErr) {
            console.error("Error updating password:", updateErr);
          } else {
            console.log("Password securely hashed for user:", user.username);
          }
        });

        // Continue with login
        const token = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({ message: "Login successful", token, user: { id: user.user_id, username: user.username, email: user.email, wallet_balance: user.wallet_balance } });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    // If password is already hashed, verify it using bcrypt
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Successful login
    const token = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login successful", token, user: { id: user.user_id, username: user.username, email: user.email, wallet_balance: user.wallet_balance } });
  });
});

// Get user information
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT u.user_id, u.username, ui.email, ui.wallet_balance
    FROM users u
    JOIN user_info ui ON u.user_id = ui.user_id
    WHERE u.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user information:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sql = "UPDATE user_info SET u_password = ? WHERE email = ?";
    db.query(sql, [hashedPassword, email], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Password reset successfully" });
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// Handle checkout process
router.post("/:userId/checkout", (req, res) => {
  const userId = req.params.userId;
  const { subtotal } = req.body;

  // Fetch user's current wallet balance
  const fetchWalletSql = "SELECT wallet_balance FROM user_info WHERE user_id = ?";
    db.query(fetchWalletSql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching wallet balance:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const currentBalance = results[0]?.wallet_balance;
        if (currentBalance < subtotal) {
            return res.status(400).json({ success: false, message: "Insufficient funds" });
        }

        // Fetch cart items for the user
        const fetchCartSql = `
    SELECT c.item_id, c.quantity, p.price
    FROM carts c
    JOIN products p ON c.item_id = p.product_id
    WHERE c.user_id = ?
`;
        db.query(fetchCartSql, [userId], (err, cartItems) => {
            if (err) {
                console.error("Error fetching cart items:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (cartItems.length === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty" });
            }
            if (cartItems.some(item => isNaN(item.price) || isNaN(item.quantity))) {
              console.error("Invalid cart data:", cartItems);
              return res.status(400).json({ error: "Invalid cart data. Please check your cart items." });
          }
          const insertPurchaseSql = `
          INSERT INTO purchases (buyer_id, cart_contents, cart_price)
          VALUES (?, ?, ?)
      `;
      const cartContents = cartItems.map(item => `${item.item_id}:${item.quantity}`).join(","); // Example: "1:2,3:1"
      db.query(insertPurchaseSql, [userId, cartContents, subtotal], (err, purchaseResult) => {
          if (err) {
              console.error("Error inserting into purchases:", err);
              return res.status(500).json({ error: "Database error" });
          }
            // Generate a unique purchase ID (e.g., timestamp)
            const purchaseId = purchaseResult.insertId;

            // Insert cart items into the history_itmes table
            const insertHistorySql = `
                INSERT INTO history_itmes (user_id, item_id, quantity, price, purchase_id)
                VALUES ?
            `;
            const historyValues = cartItems.map(item => {
              const price = parseFloat(item.price);
              const quantity = parseInt(item.quantity, 10);
          
              if (isNaN(price) || isNaN(quantity)) {
                  console.error("Invalid price or quantity for item:", item);
                  throw new Error("Invalid price or quantity");
              }
          
              return [
               
                  userId,
                  item.item_id,
                  quantity,
                  price * quantity,
                  purchaseId
              ];
          });

            db.query(insertHistorySql, [historyValues], (err) => {
                if (err) {
                    console.error("Error inserting into history_itmes:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                // Update user's wallet balance
                const newBalance = currentBalance - subtotal;
                const updateWalletSql = "UPDATE user_info SET wallet_balance = ? WHERE user_id = ?";
                db.query(updateWalletSql, [newBalance, userId], (err) => {
                    if (err) {
                        console.error("Error updating wallet balance:", err);
                        return res.status(500).json({ error: "Database error" });
                    }

                    // Clear the user's cart
                    const clearCartSql = "DELETE FROM carts WHERE user_id = ?";
                    db.query(clearCartSql, [userId], (err) => {
                        if (err) {
                            console.error("Error clearing cart:", err);
                            return res.status(500).json({ error: "Database error" });
                        }

                        res.json({
                            success: true,
                            message: "Checkout completed successfully!",
                            newWalletBalance: newBalance
                        });
                    });
                });
            });
        });
    });
});
});

router.post("/:userId/purchase", (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  const getProductSql = `
      SELECT price, seller_id, inventory
      FROM products
      WHERE product_id = ?
  `;

  db.query(getProductSql, [productId], (err, productResults) => {
      if (err) {
          console.error("Error fetching product:", err);
          return res.status(500).json({ error: "Database error" });
      }

      if (productResults.length === 0) {
          return res.status(404).json({ error: "Product not found" });
      }

      const product = productResults[0];
      const totalCost = product.price * quantity;

      if (product.inventory < quantity) {
          return res.status(400).json({ error: "Insufficient inventory" });
      }

      // Deduct from buyer's wallet
      const deductWalletSql = `
          UPDATE user_info
          SET wallet_balance = wallet_balance - ?
          WHERE user_id = ? AND wallet_balance >= ?
      `;

      db.query(deductWalletSql, [totalCost, userId, totalCost], (err, deductResult) => {
          if (err) {
              console.error("Error deducting wallet balance:", err);
              return res.status(500).json({ error: "Database error" });
          }

          if (deductResult.affectedRows === 0) {
              return res.status(400).json({ error: "Insufficient funds" });
          }

          // Add to seller's wallet
          const addWalletSql = `
              UPDATE user_info
              SET wallet_balance = wallet_balance + ?
              WHERE user_id = ?
          `;

          db.query(addWalletSql, [totalCost, product.seller_id], (err, addResult) => {
              if (err) {
                  console.error("Error adding to seller's wallet:", err);
                  return res.status(500).json({ error: "Database error" });
              }

              // Update product inventory
              const updateInventorySql = `
                  UPDATE products
                  SET inventory = inventory - ?
                  WHERE product_id = ?
              `;

              db.query(updateInventorySql, [quantity, productId], (err, updateResult) => {
                  if (err) {
                      console.error("Error updating inventory:", err);
                      return res.status(500).json({ error: "Database error" });
                  }

                  res.json({ success: true, message: "Purchase successful" });
              });
          });
      });
  });
});
router.post("/:userId/increase-balance", (req, res) => {
  const userId = req.params.userId;
  const { amount } = req.body;

  // Fetch user's current wallet balance
  const fetchWalletSql = "SELECT wallet_balance FROM user_info WHERE user_id = ?";
  db.query(fetchWalletSql, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching wallet balance:", err);
          res.status(500).json({ error: "Database error" });
      } else {
          const currentBalance = results[0].wallet_balance;
          const newBalance = currentBalance + amount;

          // Update user's wallet balance
          const updateWalletSql = "UPDATE user_info SET wallet_balance = ? WHERE user_id = ?";
          db.query(updateWalletSql, [newBalance, userId], (err, result) => {
              if (err) {
                  console.error("Error updating wallet balance:", err);
                  res.status(500).json({ error: "Database error" });
              } else {
                  res.json({ success: true, newWalletBalance: newBalance });
              }
          });
      }
  });
});
router.post("/:userId/wallet/add", (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
  }

  const sql = `
      UPDATE user_info
      SET wallet_balance = wallet_balance + ?
      WHERE user_id = ?
  `;

  db.query(sql, [amount, userId], (err, result) => {
      if (err) {
          console.error("Error updating wallet balance:", err);
          return res.status(500).json({ error: "Database error" });
      }

      res.json({ success: true, message: `Wallet updated by $${amount}` });
  });
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../frontend/images/"); // Saves files in backend/uploads/
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });


router.post("/:userId/add-product", upload.single('p_image'), (req, res) => {
  const userId = req.params.userId;
  const { product_name, p_description, price, inventory } = req.body;
  const p_image = req.file ? req.file.filename : null;

  // Check if the user is a seller
  const checkSellerSQL = "SELECT * FROM sellers WHERE owner_id = ?";
  db.query(checkSellerSQL, [userId], (err, results) => {
    if (err) {
      console.error("Error checking seller existence:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      // User is a seller
      const sellerId = results[0].seller_id;
      insertProduct(sellerId);  // Call insertProduct with the sellerId
    } else {
      // User is not a seller
      return res.status(403).json({ message: "Only sellers can add products. Please upgrade your account." });
    }
  });

  function insertProduct(sellerId) {
    const sql = `
      INSERT INTO products (product_name, seller_id, price, inventory, p_description, p_image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [product_name, sellerId, price, inventory, p_description, p_image], (err) => {
      if (err) {
        console.error("Error adding product:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
    });
  }
});

// Fetch user's products
router.get("/:userId/my-products", (req, res) => {
  const userId = req.params.userId;
 
  const sql = `
      SELECT * FROM products
      WHERE seller_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching user's products:", err);
          return res.status(500).json({ error: "Database error" });
      }
    
      res.json(results);
  });
});

// Update product
router.put("/:userId/update-product/:productId", upload.single('p_image'), (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;
  const { product_name, p_description, price, inventory } = req.body;
  const p_image = req.file ? req.file.filename : null;

  const sql = `
      UPDATE products
      SET product_name = ?, p_description = ?, price = ?, inventory = ?, p_image = ?
      WHERE product_id = ? AND seller_id = ?
  `;
  db.query(sql, [product_name, p_description, price, inventory, p_image, productId, userId], (err, result) => {
      if (err) {
          console.error("Error updating product:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
  });
});

// Delete product
router.delete("/:userId/delete-product/:productId", (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;

  const sql = `
      DELETE FROM products
      WHERE product_id = ? AND seller_id = ?
  `;
  db.query(sql, [productId, userId], (err, result) => {
      if (err) {
          console.error("Error deleting product:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
  });
});
router.get("/products", (req, res) => {
  const sql = `
      SELECT p.*, s.company_name AS seller_name 
      FROM products p
      JOIN sellers s ON p.seller_id = s.seller_id
  `;
  db.query(sql, (err, results) => {
      if (err) {
          console.error("Error fetching products:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });
});
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = "SELECT seller_id FROM sellers WHERE owner_id = ?";
  db.query(sql, [userId], (err, result) => {
      if (err) {
          console.error("Error fetching user:", err);
          return res.status(500).json({ error: "Database error" });
      }
      if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }
      res.json(result[0]); // { seller_id: value }
  });
});
router.post('/:userId/upgrade', (req, res) => {
  let userId = req.params.userId;  // Get the user ID from the URL parameter
  console.log('Received userId:', userId); // Log the userId to check its value
  const { company_name } = req.body; // Get the company name from the request body

  // Check if company name is provided
  if (!company_name) {
      return res.status(400).json({ message: "Company name is required" });
  }
  userId = parseInt(userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
}
  // Check if the user is already a seller
  db.query('SELECT * FROM sellers WHERE owner_id = ?', [userId], (err, results) => {
      if (err) {
          console.error("Error checking if user is already a seller:", err);
          return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
          return res.status(400).json({ message: "You are already a seller." });
      }

      // Insert the user as a seller
      const insertSellerSQL = 'INSERT INTO sellers (company_name, owner_id) VALUES (?, ?)';
      db.query(insertSellerSQL, [company_name, userId], (err, result) => {
          if (err) {
              console.error("Error upgrading user to seller:", err);
              return res.status(500).json({ message: "Error upgrading user to seller" });
          }

          // Send success response
          res.status(200).json({ message: "Successfully upgraded to seller!" });
      });
  });
});
router.get("/:userId/reviews", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
  }

  const sellerReviewsQuery = `
      SELECT sr.review_id, sr.comment, sr.rating, 
             u.username AS reviewer, 
             s.company_name AS seller
      FROM seller_reviews sr
      JOIN users u ON sr.review_source = u.user_id
      JOIN sellers s ON sr.review_subject = s.seller_id
      WHERE sr.review_subject = ?
  `;

  const userReviewsQuery = `
      SELECT ur.review_id, ur.comment, ur.rating, 
             reviewer.username AS reviewer, 
             subject.username AS reviewed_user
      FROM user_reviews ur
      JOIN users reviewer ON ur.comment_source = reviewer.user_id
      JOIN users subject ON ur.comment_subject = subject.user_id
      WHERE ur.comment_subject = ?
  `;

  try {
      const [sellerReviews] = await db.promise().query(sellerReviewsQuery, [userId]);
      const [userReviews] = await db.promise().query(userReviewsQuery, [userId]);

      res.json({ sellerReviews, userReviews });
  } catch (err) {
      console.error("Error fetching reviews:", err);
      res.status(500).json({ error: "Failed to fetch reviews" });
  }
});
router.post("/:userId/seller-reviews", (req, res) => {
  const { comment, rating, review_source, product_id } = req.body;
  const review_subject = parseInt(req.params.userId);

  if (!comment || !rating || !review_source || !review_subject || !product_id) {
    console.error("Missing required fields:", { comment, rating, review_source, review_subject, product_id });
      return res.status(400).json({ error: "All fields are required." });
  }

  const sql = `
      INSERT INTO seller_reviews (comment, product_id, rating, review_source, review_subject) 
      VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [comment, product_id, rating, review_source, review_subject], (err, result) => {
      if (err) {
          console.error("Error adding seller review:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Seller review added successfully", id: result.insertId });
  });
});

// Add a user review for a specific user
router.post("/:userId/user-reviews", (req, res) => {
  const { comment, rating, comment_source, product_id } = req.body;

  const comment_subject = parseInt(req.params.userId, 10);

  if (!comment || !rating || !comment_subject || !comment_source || !product_id) {
    console.error("Missing required fields:", { comment, rating, comment_subject, comment_source, product_id });
      return res.status(400).json({ error: "All fields are required." });
  }

  const sql = `
      INSERT INTO user_reviews (comment, product_id rating, comment_subject, comment_source) 
      VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [comment, product_id, rating,  comment_subject, comment_source], (err, result) => {
      if (err) {
          console.error("Error adding user review:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "User review added successfully", id: result.insertId });
  });
});
router.get("/search", async (req, res) => {
  const { query, type } = req.query; // `query` is the search term, `type` is "seller" or "user"
  let sql;

  if (type === "seller") {
      sql = `SELECT seller_id AS id, company_name AS name FROM sellers WHERE company_name LIKE ?`;
  } else if (type === "user") {
      sql = `SELECT user_id AS id, username AS name FROM users WHERE username LIKE ?`;
  } else {
      return res.status(400).json({ error: "Invalid type" });
  }

  try {
      const [results] = await db.promise().query(sql, [`%${query}%`]);
      res.json(results);
  } catch (err) {
      console.error("Error fetching search results:", err);
      res.status(500).json({ error: "Database error" });
  }
});
router.get("/:userId/history", (req, res) => {
  const userId = req.params.userId;

  const sql = `
  SELECT 
      hi.history_items_id, 
      hi.quantity, 
      hi.price, 
      p.product_name, 
      p.p_description, 
      p.p_image, 
      p.product_id,
      p.seller_id,
      ur.rating AS user_rating, 
      ur.comment AS user_comment
  FROM history_itmes hi
  JOIN products p ON hi.item_id = p.product_id
  LEFT JOIN user_reviews ur ON hi.item_id = ur.product_id AND hi.user_id = ur.comment_source
  WHERE hi.user_id = ?
  ORDER BY hi.history_items_id DESC
`;


  db.query(sql, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching purchase history:", err);
          return res.status(500).json({ error: "Database error" });
      }

      res.json(results);
  });
});
router.post("/:userId/chat/messages", (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  // Insert the message into the messages table
  db.query(
      "INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, 0)",
      [senderId, receiverId, message],
      (err, result) => {
          if (err) {
              console.error("❌ Error inserting message:", err);
              return res.status(500).json({ error: "Database error while inserting message" });
          }

          // Create a notification for the receiver
          db.query(
              "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, 0)",
              [receiverId, `You have a new message from user ${senderId}`],
              (err, notificationResult) => {
                  if (err) {
                      console.error("❌ Error creating notification:", err);
                      return res.status(500).json({ error: "Database error while creating notification" });
                  }

                  res.json({ message: "Message sent and notification created" });
              }
          );
      }
  );
});
router.get("/:userId/chat/messages", (req, res) => {
  const userId1 = req.params.userId;
  const userId2 = req.query.userId2;

  if (!userId2) {
      return res.status(400).json({ error: "User ID of the other participant is required." });
  }

  const sql = `
      SELECT sender_id, receiver_id, message, timestamp
      FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC
  `;

  db.query(sql, [userId1, userId2, userId2, userId1], (err, results) => {
      if (err) {
          console.error("Error fetching messages:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });
});
router.get("/:userId/inbox", (req, res) => {
  const userId = req.params.userId;

  const sql = `
      SELECT 
          m.message_id,
          m.sender_id,
          m.receiver_id,
          m.message,
          m.timestamp,
          CASE 
              WHEN m.sender_id = ? THEN m.receiver_id
              ELSE m.sender_id
          END AS other_user_id,
          u.username AS other_user_name,
          n.notification_id -- Include notification ID
      FROM messages m
      JOIN users u ON u.user_id = CASE 
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
      END
      LEFT JOIN notifications n ON n.user_id = ? 
          AND n.message LIKE CONCAT('%', m.sender_id, '%') 
          AND n.is_read = 0 -- Only include unread notifications
      WHERE (m.sender_id = ? OR m.receiver_id = ?)
      AND m.message_id = (
          SELECT MAX(message_id)
          FROM messages
          WHERE (sender_id = m.sender_id AND receiver_id = m.receiver_id)
             OR (sender_id = m.receiver_id AND receiver_id = m.sender_id)
      )
      ORDER BY m.timestamp DESC
  `;

  db.query(sql, [userId, userId, userId, userId, userId], (err, results) => {
      if (err) {
          console.error("Error fetching inbox messages:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });});


router.get("/:userId/notifications", (req, res) => {
  const { userId } = req.params;

   db.query(
        "SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 1",
        [userId],
        (err, results) => {
            if (err) {
                console.error("Error fetching notifications:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json(results);
        }
    );
});


router.get("/:userId/notifications/count", (req, res) => {
  const { userId } = req.params;

  db.query("SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0", [userId], (error, results) => {
      if (error) {
          console.error("Error fetching unread notification count:", error);
          return res.status(500).json({ error: "Server error" });
      }
      res.json({ unread_count: results[0].unread_count });
  });
});


router.post("/:userId/notifications/mark-read/:notificationId", (req, res) => {
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;

  const sql = `
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ? AND notification_id = ?
  `;

  db.query(sql, [userId, notificationId], (err, result) => {
      if (err) {
          console.error("Error marking notification as read:", err);
          return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Notification not found or already read" });
      }

      res.json({ success: true, message: "Notification marked as read" });
  });
});

module.exports = router;