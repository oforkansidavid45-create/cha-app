require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Message = require("./models/message");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const io = new Server(server, {
  cors: { origin: "*" }
});

// =========================
// ONLINE USERS
// =========================
let onlineUsers = {};

// =========================
// ROOM HELPER
// =========================
function getRoomId(a, b) {
  return [a, b].sort().join("-");
}

io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  // JOIN
  socket.on("join", (username) => {
    socket.username = username;
    onlineUsers[socket.id] = username;

    io.emit("updateOnlineUsers", Object.values(onlineUsers));
  });

  // JOIN ROOM
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // LOAD ROOM MESSAGES
  socket.on("loadRoomMessages", async (roomId) => {
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    socket.emit("roomMessages", messages);
  });

  // SEND PRIVATE MESSAGE
  socket.on("sendPrivateMessage", async ({ from, to, text }) => {

    const roomId = getRoomId(from, to);

    const message = await Message.create({
      user: from,
      text,
      roomId,
      status: "sent",
      createdAt: new Date()
    });

    io.to(roomId).emit("receivePrivateMessage", {
      user: from,
      text,
      roomId,
      status: "delivered",
      createdAt: message.createdAt
    });
  });

  // TYPING
  socket.on("typing", (name) => {
    socket.broadcast.emit("showTyping", name);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("hideTyping");
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("updateOnlineUsers", Object.values(onlineUsers));
  });

});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("Server running:", PORT));