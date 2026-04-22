require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./src/modules/users/userRoutes");
const courseRoutes = require("./src/modules/courses/courseRoutes");

// APP SETUP
const app = express();
app.use(cors());
app.use(express.json());

// =======================
// ROUTES
// =======================

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Modular Routes
app.use("/", userRoutes); // To keep backward compatibility with /, /test-db, /lookup-email, /sync-user, /user/me, /user
app.use("/courses", courseRoutes);

// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});