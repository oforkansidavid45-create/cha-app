const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  }

}, {
  timestamps: true   // 🔥 auto adds createdAt & updatedAt
});

// 🔥 prevent duplicate index issues
UserSchema.index({ username: 1 });

module.exports = mongoose.model("User", UserSchema);