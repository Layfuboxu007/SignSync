require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./src/modules/users/userRoutes");
const courseRoutes = require("./src/modules/courses/courseRoutes");
const adminRoutes = require("./src/modules/admin/adminRoutes");

// APP SETUP
const app = express();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:5173",
      "https://sign-sync-ten.vercel.app"
    ];
    
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
    }

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// =======================
// ROUTES
// =======================

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is working!");
});

const errorHandler = require("./src/middleware/errorHandler");

// Modular Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/admin", adminRoutes);

// Global Error Handler
app.use(errorHandler);

// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});