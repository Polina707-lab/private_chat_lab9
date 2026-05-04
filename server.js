import express from "express";
import http from "http";
import { initSocket } from "./socket.js";

const app = express();
const server = http.createServer(app);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", {
    title: "Главная",
  });
});

app.get("/chat", (req, res) => {
  res.render("chat", {
    title: "Private Chat",
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

initSocket(server);
