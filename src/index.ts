import express from "express";
import http from "http"
import { WebSocketServer, type WebSocket } from "ws";

const app = express(); //Just an express Application, which defines routes and handles HTTP requests

//for middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat server is running");
});

const server = http.createServer(app);
const PORT = process.env.PORT?? 3000

const wss = new WebSocketServer({server, path: "/ws"}) //The server option is specifically how ws shares the same HTTP server as Express; path restricts which URL path performs the WebSocket upgrade

wss.on("connection", (socket: WebSocket) => {
  console.log("WebSocket connected success!!")

  socket.on("message", (data)=> {
    console.log(data.toString());
  })

  socket.send("This is from Server...")
})

app.get("/health", (req, res) => {
  res.json({ Status: "ok" });
});

app.post("/messages", (req, res) => {
  if (!req.body)
    return res.status(400).json({
      Status: "error",
      message: "No body found",
    });
  const { message } = req.body;
  if (typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Invalid message",
    });
  }
  return res.status(201).json({
    status: "success",
    message: message,
  });
});

// app.listen(3000, () => {
//   // this starts an HTTP server internally and makes your app listen on port 3000.
//   console.log("Server running at http://localhost:3000");
// });
server.listen(PORT, () => {
  console.log("Server is running at http://localhost:3000");
})