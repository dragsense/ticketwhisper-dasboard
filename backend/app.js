const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const websiteRoutes = require("./routes/websiteRoutes");
const scrapeRoutes = require("./routes/scrapeRoutes");
const userRoutes = require("./routes/userRoutes");
const MongoStore = require("connect-mongo"); 
const path = require("path");
dotenv.config(); // Load .env variables
connectDB();

const app = express();
app.use(cors({ origin: "http://localhost:5000", credentials: true })); // Adjust the origin for your frontend
app.use(express.json());
app.use(cookieParser());

// Setup session
app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, 
      collectionName: "sessions", 
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);
// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  if (req.session.user) {
    next(); // User is authenticated
  } else {
    res.status(401).json({ status: false, message: "Unauthorized" });
  }
};

// Protected route to check authentication status
app.use("/api/admin/session", authMiddleware, (req, res) => {
  res.json({ status: true, message: "User is authenticated" });
});

// Login route to set session cookie
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ status: false, message: "Username and password are required" });
  }

  // Check credentials with environment variables
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.user = { username }; // Store user info in session
    return res.json({ status: true, message: "Login successful" });
  }

  return res
    .status(401)
    .json({ status: false, message: "Invalid credentials" });
});

// Logout route to clear the session
app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: false, message: "Error logging out" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.json({ status: true, message: "Logged out successfully" });
  });
});

// Apply authMiddleware to protect specific routes
app.use("/api/websites", authMiddleware, websiteRoutes);
app.use("/api/urls", authMiddleware, scrapeRoutes);
app.use("/api/users", authMiddleware, userRoutes);

app.use(express.static(path.join(__dirname, '../frontend/build'))); 

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html')); 
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
