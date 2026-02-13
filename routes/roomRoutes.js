const express = require("express");
const router = express.Router();

const {
  renderHome,
  createRoom,
  getRoom
} = require("../controllers/roomController");

// Home Page
router.get("/", renderHome);

// Create Room
router.post("/create-room", createRoom);

// Join Room
router.get("/room/:roomId", getRoom);

module.exports = router;
