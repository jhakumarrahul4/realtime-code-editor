const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");

/**
 * @desc Render Home Page
 * @route GET /
 */
exports.renderHome = (req, res) => {
  res.render("home");
};


/**
 * @desc Create New Room
 * @route POST /create-room
 */
exports.createRoom = async (req, res) => {
  try {
    const roomId = uuidv4();

    const newRoom = new Room({
      roomId,
      code: "",
      language: "63" // Default: JavaScript
    });

    await newRoom.save();

    return res.redirect(`/room/${roomId}`);
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).send("Server Error");
  }
};


/**
 * @desc Get Room by ID
 * @route GET /room/:roomId
 */
exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).send("Room not found");
    }

    res.render("editor", {
      roomId: room.roomId,
      code: room.code,
      language: room.language
    });

  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).send("Server Error");
  }
};
