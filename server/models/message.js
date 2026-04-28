const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },

  text: {
    type: String,
    required: true
  },

  // 🔥 IMPORTANT FOR PRIVATE CHAT
  roomId: {
    type: String,
    required: true,
    index: true
  },

  // 🔥 MESSAGE STATUS (WhatsApp-style)
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", MessageSchema);