const socket = io();

const name = prompt("Введите ваше имя:")?.trim() || "Аноним";

const myNameElement = document.getElementById("myName");

if (myNameElement) {
  myNameElement.textContent = name;
}

socket.on("connect", () => {
  console.log("Подключено к серверу", socket.id);
  socket.emit("register", name);
});

socket.on("disconnect", () => {
  console.log("Отключено от сервера");
});

socket.on("clientsList", (clients) => {
  const usersDiv = document.getElementById("users");
  usersDiv.innerHTML = "";

  Object.entries(clients).forEach(([id, user]) => {
    const wrapper = document.createElement("div");

    if (id === socket.id) {
      wrapper.textContent = `${user.name} (Вы)`;
      wrapper.classList.add("current-user");
    } else {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = id;

      const label = document.createElement("label");
      label.textContent = user.name;

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
    }

    usersDiv.appendChild(wrapper);
  });
});

document.getElementById("sendBtn").onclick = () => {
  const messageInput = document.getElementById("msg");
  const message = messageInput.value.trim();

  if (!message) {
    alert("Введите сообщение");
    return;
  }

  const type = document.querySelector(
    'input[name="messageType"]:checked',
  ).value;

  if (type === "public") {
    socket.emit("publicMessage", {
      message,
    });
  } else {
    const selected = [...document.querySelectorAll("#users input:checked")].map(
      (checkbox) => checkbox.value,
    );

    if (selected.length === 0) {
      alert("Выберите получателя");
      return;
    }

    socket.emit("sendToSelected", {
      ids: selected,
      message,
    });
  }

  messageInput.value = "";
};

document.getElementById("msg").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("sendBtn").click();
  }
});

socket.on("publicMessage", ({ from, message }) => {
  addMessage(`${from} всем: ${message}`, "public");
});

socket.on("privateMessage", ({ from, message }) => {
  addMessage(`${from} лично вам: ${message}`, "private");
});

socket.on("privateMessageSent", ({ to, message }) => {
  addMessage(`Вы лично для ${to}: ${message}`, "private");
});

socket.on("systemMessage", ({ message }) => {
  addMessage(message, "system");
});

function addMessage(text, type) {
  const chat = document.getElementById("chat");

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", type);
  messageDiv.textContent = text;

  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
}
