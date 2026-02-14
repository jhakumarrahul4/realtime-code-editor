if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");
const runRoutes = require("./routes/runRoutes");

// ===============================
// Initialize App
// ===============================
const app = express();
const server = http.createServer(app);

// ===============================
// Yjs WebSocket Server Setup
// ===============================
const wss = new WebSocket.Server({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

console.log("✅ Yjs WebSocket server initialized");

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
// Health Check
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
