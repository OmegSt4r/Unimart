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
          res.status(500).json({ error: "Database error" });
      } else {
          const currentBalance = results[0].wallet_balance;
          if (currentBalance < subtotal) {
              res.status(400).json({ success: false, message: "Insufficient funds" });
          } else {
              // Fetch cart items for the user
              const fetchCartSql = "SELECT * FROM carts WHERE user_id = ?";
              db.query(fetchCartSql, [userId], (err, cartItems) => {
                  if (err) {
                      console.error("Error fetching cart items:", err);
                      return res.status(500).json({ error: "Database error" });
                  }

                 
                  // Update user's wallet balance
                  const newBalance = currentBalance - subtotal;
                  const updateWalletSql = "UPDATE user_info SET wallet_balance = ? WHERE user_id = ?";
                  db.query(updateWalletSql, [newBalance, userId], (err, result) => {
                      if (err) {
                          console.error("Error updating wallet balance:", err);
                          return res.status(500).json({ error: "Database error" });
                      }

                      // Clear the user's cart
                      const clearCartSql = "DELETE FROM carts WHERE user_id = ?";
                      db.query(clearCartSql, [userId], (err, result) => {
                          if (err) {
                              console.error("Error clearing cart:", err);
                              return res.status(500).json({ error: "Database error" });
                          }

                          res.json({ success: true, newWalletBalance: newBalance });
                      });
                  });
              });
          }
      }
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, '../frontend/images/');
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
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

module.exports = router;