import express from "express";
import argon2 from "argon2";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import pool from "./db";
import jwt from "jsonwebtoken";
import { send } from "process";

const app = express(); //Just an express Application, which defines routes and handles HTTP requests

//for middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat server is running");
});

const server = http.createServer(app);
const PORT = process.env.PORT ?? 3000;

// const wss = new WebSocketServer({ server, path: "/ws" }); //The server option is specifically how ws shares the same HTTP server as Express; path restricts which URL path performs the WebSocket upgrade
//means: “Automatically accept every WebSocket upgrade request sent to /ws on this HTTP server.” The noServer: true version means: “Do not accept upgrades automatically—I will inspect and approve each one myself.”

const wss = new WebSocketServer({ noServer: true });

//since noserver:true, the ws module cannot accept the upgrade req automatically. So we need to do it manually by adding own authentication too.
server.on("upgrade", (request, socket, header) => {
  const url = new URL(request.url!, `http://${request.headers.host}`);

  if (url.pathname !== "/ws") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n"); //since the server has a running TCP connection with a websocket upgrade request, that TCP conncection also closes with some responses.
    socket.destroy();
    return;
  }

  const authheader = request.headers.authorization;

  if (!authheader || !authheader.startsWith("Bearer ")) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const token = authheader.split(" ")[1];

  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  try {
    const payload = jwt.verify(
      //here JWT.verify returns the original payload if valid or else returns an error.
      token,
      process.env.JWT_SECRET as string,
    ) as { userId: number };

    wss.handleUpgrade(request, socket, header, (ws) => {
      (ws as any).userId = payload.userId;

      wss.emit("connection", ws, request);
    });
    //Tells the ws library: “This request passed authentication—upgrade this HTTP/TCP connection into a WebSocket.”
    //attatching userId for the ws helps to identify the user
  } catch (error) {
    console.log("Invalid WebSocket token");
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", (socket: WebSocket) => {
  console.log("WebSocket connected success!!");

  socket.on("message", async (data) => {
    //here socket represents the client
    const senderId = (socket as any).userId;
    let message;
    //validating message
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      console.log("Invalid JSON received");
      return;
    }

    //validating user and content
    if (
      !Number.isInteger(message.receiverId) ||
      typeof message.content !== "string" ||
      message.content.trim() === ""
    ) {
      console.log("Invalid message format", data.toString());
      return;
    }
    let savedMessage;
    const receiverId = message.receiverId;
    try {
      const result = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
        [senderId, receiverId, message.content],
      );
      savedMessage = result.rows[0];
    } catch (error) {
      console.log("Failed to store the message", error);
      return;
    }

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client as any).userId === receiverId
      ) {
        client.send(JSON.stringify(savedMessage));
      }
    });
  });

  // socket.send("This is from Server...")
});

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

app.post("/register", async (req, res) => {
  if (!req.body)
    return res.status(400).json({
      Status: "error",
      message: "No body found",
    });

  const { username, password } = req.body;
  if (
    !username ||
    typeof username !== "string" ||
    username.trim() === "" ||
    typeof password !== "string" ||
    !password ||
    password.trim() === ""
  ) {
    return res.status(400).json({
      status: "error",
      message: "username and password required",
    });
  }
  try {
    const hash = await argon2.hash(password);
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hash],
    );
    console.log("User", username, "Successfully registered!!");
    return res.status(201).json({
      status: "success",
      message: result.rows[0],
    });
  } catch (error) {
    console.log("Registration failed", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to register user",
    });
  }
});

app.post("/login", async (req, res) => {
  if (!req.body)
    return res.status(400).json({
      Status: "error",
      message: "No body found",
    });

  const { username, password } = req.body;
  if (
    !username ||
    typeof username !== "string" ||
    username.trim() === "" ||
    typeof password !== "string" ||
    !password ||
    password.trim() === ""
  ) {
    return res.status(400).json({
      status: "error",
      message: "username and password required",
    });
  }
  try {
    const user = await pool.query(
      `SELECT id, username, password_hash FROM users WHERE username = $1; `,
      [username],
    );

    if (!user.rows[0]) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const storedHash = user.rows[0].password_hash;
    const valid_password = await argon2.verify(storedHash, password); //returns true if the curr password entered matches the corresponding stored hash

    if (!valid_password) {
      return res.status(400).json({
        status: "error",
        message: "Invalid password",
      });
    }
    const payload = { userId: user.rows[0].id };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    //here the actual JWT token contains three parts separated by dots header.payload.signature. A typical payload contains the details we provide like userid and other like iat[issuedAt], exp[expiry].
    console.log("User Login Successfull");
    return res.status(200).json({
      status: "success",
      message: "User Login Suceessfull",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
});

// app.listen(3000, () => {
//   // this starts an HTTP server internally and makes your app listen on port 3000.
//   console.log("Server running at http://localhost:3000");
// });
server.listen(PORT, () => {
  console.log("Server is running at http://localhost:3000");
});
