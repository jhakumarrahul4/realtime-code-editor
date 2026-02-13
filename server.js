require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIO = require("socket.io");

const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");
const runRoutes = require("./routes/runRoutes");
const socketHandler = require("./sockets/socketHandler");

// ===============================
// Initialize App
// ===============================
const app = express();
const server = http.createServer(app);

// ===============================
// Socket.io Setup
// ===============================
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ===============================
// Connect Database
// ===============================
connectDB();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ===============================
// View Engine
// ===============================
app.set("view engine", "ejs");
app.set("views", "./views");

// ===============================
// Routes
// ===============================
app.use("/", roomRoutes);
app.use("/api", runRoutes);

// ===============================
// Socket Handler
// ===============================
socketHandler(io);

// ===============================
// Default Route (Optional Health Check)
// ===============================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
