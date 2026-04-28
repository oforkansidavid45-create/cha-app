const socket = io("https://dave-whatsappmadeasy.onrender.com");

// ask username
let username = prompt("Enter your name:");

if (!username) {
  username = "Anonymous";
}

// 👉 join system
socket.emit("join", username);

// =========================
// 💬 ADD MESSAGE
// =========================
function addMessage(data, type) {
  const div = document.createElement("div");
  div.classList.add("message", type);

  let ticks = "";

  if (data.user === username) {
    if (data.status === "sent") ticks = " ✔";
    if (data.status === "delivered") ticks = " ✔✔";
    if (data.status === "read") ticks = " ✔✔ (blue)";
  }

  div.textContent = `${data.user}: ${data.text} ${ticks}`;

  const messages = document.getElementById("messages");
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// =========================
// 📤 SEND MESSAGE
// =========================
function send() {
  const input = document.getElementById("msg");
  const msg = input.value;

  if (msg.trim() === "") return;

  const fullMessage = {
    user: username,
    text: msg,
    status: "sent"
  };

  socket.emit("sendMessage", fullMessage);

  input.value = "";
}

// =========================
// 📥 RECEIVE MESSAGE
// =========================
socket.on("receiveMessage", (data) => {
  if (data.user === username) {
    addMessage(data, "sent");
  } else {
    addMessage(data, "received");
  }
});

// =========================
// 📜 HISTORY
// =========================
socket.emit("loadMessages");

socket.on("messageHistory", (messages) => {
  messages.forEach((data) => {
    if (data.user === username) {
      addMessage(data, "sent");
    } else {
      addMessage(data, "received");
    }
  });
});

// =========================
// ⌨️ TYPING
// =========================
let typingTimeout;

document.getElementById("msg").addEventListener("input", () => {
  socket.emit("typing", username);

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping");
  }, 1000);
});

socket.on("showTyping", (name) => {
  let typingDiv = document.getElementById("typing");

  if (!typingDiv) {
    typingDiv = document.createElement("div");
    typingDiv.id = "typing";
    typingDiv.className = "typing";
    document.getElementById("messages").appendChild(typingDiv);
  }

  typingDiv.textContent = `${name} is typing...`;
});

socket.on("hideTyping", () => {
  const typingDiv = document.getElementById("typing");
  if (typingDiv) typingDiv.remove();
});

// =========================
// 🟢 ONLINE USERS (FIXED)
// =========================
socket.on("updateOnlineUsers", (users) => {
  const onlineDiv = document.getElementById("onlineUsers");

  if (!onlineDiv) return;

  onlineDiv.innerHTML = `
    🟢 Online Users <br>
    ${users.map(user => `• ${user}`).join("<br>")}
  `;
});