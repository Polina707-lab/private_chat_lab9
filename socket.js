import { Server } from "socket.io";

export function initSocket(httpServer) {
  const io = new Server(httpServer);

  const clients = {};

  io.on("connection", (socket) => {
    console.log("Пользователь подключился:", socket.id);

    socket.on("register", (name) => {
      clients[socket.id] = {
        id: socket.id,
        name: name?.trim() || "Аноним",
      };

      console.log(`Зарегистрирован пользователь: ${clients[socket.id].name}`);

      io.emit("clientsList", clients);

      socket.broadcast.emit("systemMessage", {
        message: `${clients[socket.id].name} подключился к чату`,
      });
    });

    socket.on("publicMessage", ({ message }) => {
      const sender = clients[socket.id]?.name || "Аноним";

      console.log(`[Общее сообщение] ${sender}: ${message}`);

      io.emit("publicMessage", {
        from: sender,
        message,
      });
    });

    socket.on("sendToSelected", ({ ids, message }) => {
      const sender = clients[socket.id]?.name || "Аноним";

      const recipients = ids
        .map((id) => clients[id]?.name || "Пользователь")
        .join(", ");

      console.log(`[Личное сообщение] ${sender} -> ${recipients}: ${message}`);

      ids.forEach((id) => {
        io.to(id).emit("privateMessage", {
          from: sender,
          message,
        });
      });

      socket.emit("privateMessageSent", {
        to: recipients,
        message,
      });
    });

    socket.on("disconnect", () => {
      const userName = clients[socket.id]?.name;

      delete clients[socket.id];

      io.emit("clientsList", clients);

      if (userName) {
        socket.broadcast.emit("systemMessage", {
          message: `${userName} отключился от чата`,
        });
      }

      console.log(
        `Пользователь отключился: ${userName || "Неизвестный"} (${socket.id})`,
      );
    });
  });
}
