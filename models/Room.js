const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    code: {
      type: String,
      default: ""
    },

    language: {
      type: String,
      default: "63" // Default: JavaScript (Judge0 ID)
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("Room", roomSchema);
