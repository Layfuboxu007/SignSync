// IMPORTS
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// APP SETUP
const app = express();
app.use(cors());
app.use(express.json());

// DATABASE
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// CREATE TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// =======================
// ROUTES
// =======================

// TEST ROUTE (optional but useful)
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({ error: "Username already exists" });
        }

        res.json({ message: "User registered successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ error: "Invalid password" });
      }

      const token = jwt.sign({ id: user.id }, "secretkey", {
        expiresIn: "1h",
      });

      res.json({ token });
    }
  );
});

// =======================
// START SERVER
// =======================

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});