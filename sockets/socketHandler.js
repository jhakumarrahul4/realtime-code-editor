const Room = require("../models/Room");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ User Connected: ${socket.id}`);

    /**
     * Join Room
     */
    socket.on("join-room", async (roomId) => {
      socket.join(roomId);
      socket.roomId = roomId;

      console.log(`User ${socket.id} joined room ${roomId}`);

      // Notify others
      socket.to(roomId).emit("user-joined", {
        message: "A new user joined the room"
      });
    });

    /**
     * Real-time Code Change
     */
    socket.on("code-change", async ({ roomId, code }) => {
      // Send updated code to other users
      socket.to(roomId).emit("code-update", code);

      // Auto-save to database
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { code }
        );
      } catch (error) {
        console.error("Error saving code:", error.message);
      }
    });

    /**
     * Language Change Sync
     */
    socket.on("language-change", async ({ roomId, language }) => {
      socket.to(roomId).emit("update-language", language);

      try {
        await Room.findOneAndUpdate(
          { roomId },
          { language }
        );
      } catch (error) {
        console.error("Error updating language:", error.message);
      }
    });

    /**
     * Sync Console Output
     * (When one user runs code, others see output)
     */
    socket.on("console-output", ({ roomId, output }) => {
      socket.to(roomId).emit("receive-console-output", output);
    });

    /**
     * Handle Disconnect
     */
    socket.on("disconnect", () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-left", {
          message: "A user left the room"
        });
      }

      console.log(`❌ User Disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
