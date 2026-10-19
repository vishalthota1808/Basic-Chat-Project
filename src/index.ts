import express, { type NextFunction, type Request, type Response } from "express";
import argon2 from "argon2";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import pool from "./db";
import jwt from "jsonwebtoken";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express(); //Just an express Application, which defines routes and handles HTTP requests

// Origins allowed to call this API from a browser (the Next.js dev server runs on 3001).
// Set CORS_ORIGIN to a comma-separated list when deploying the frontend elsewhere.
const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

//for middleware
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

/** Returns the user id inside a valid JWT, or null if the token is missing/invalid. */
function verifyToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId?: number;
    };
    return Number.isInteger(payload.userId) ? (payload.userId as number) : null;
  } catch {
    return null;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  const userId = token ? verifyToken(token) : null;

  if (userId === null) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  res.locals.userId = userId;
  next();
}

// Browsers cannot set an Authorization header on a WebSocket handshake, so the
// client exchanges its JWT for a short-lived, single-use ticket over HTTP.
const WS_TICKET_TTL_MS = 30_000;
const wsTickets = new Map<string, { userId: number; expiresAt: number }>();

function issueWsTicket(userId: number): string {
  const now = Date.now();
  for (const [ticket, entry] of wsTickets) {
    if (entry.expiresAt <= now) wsTickets.delete(ticket);
  }

  const ticket = randomUUID();
  wsTickets.set(ticket, { userId, expiresAt: now + WS_TICKET_TTL_MS });
  return ticket;
}

function consumeWsTicket(ticket: string | null): number | null {
  if (!ticket) return null;

  const entry = wsTickets.get(ticket);
  if (!entry) return null;

  wsTickets.delete(ticket); // one-time use
  return entry.expiresAt > Date.now() ? entry.userId : null;
}

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

  // A ticket (browsers) or a Bearer token (Postman/Node clients) authenticates the handshake.
  const ticketUserId = consumeWsTicket(url.searchParams.get("ticket"));
  const authheader = request.headers.authorization;
  const headerUserId = authheader?.startsWith("Bearer ")
    ? verifyToken(authheader.slice("Bearer ".length))
    : null;

  const userId = ticketUserId ?? headerUserId;

  if (userId === null) {
    console.log("Rejected WebSocket upgrade: missing or invalid credentials");
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, header, (ws) => {
    (ws as any).userId = userId;

    wss.emit("connection", ws, request);
  });
  //Tells the ws library: “This request passed authentication—upgrade this HTTP/TCP connection into a WebSocket.”
  //attatching userId for the ws helps to identify the user
});

wss.on("connection", (socket: WebSocket) => {
  const senderId = (socket as any).userId as number;
  console.log(`WebSocket connected for user ${senderId}`);

  socket.on("message", async (data) => {
    //here socket represents the client
    let message: { receiverId?: unknown; content?: unknown; clientId?: unknown };
    //validating message
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      console.log("Invalid JSON received");
      return;
    }

    const receiverId = message.receiverId;
    const content = message.content;
    // Echoed back untouched so the sender can match its optimistic message.
    const clientId = typeof message.clientId === "string" ? message.clientId : null;

    //validating user and content
    if (
      !Number.isInteger(receiverId) ||
      typeof content !== "string" ||
      content.trim() === "" ||
      content.length > 2000
    ) {
      console.log("Invalid message format", data.toString());
      return;
    }

    let savedMessage;
    try {
      const result = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
        [senderId, receiverId, content.trim()],
      );
      savedMessage = result.rows[0];
    } catch (error) {
      console.log("Failed to store the message", error);
      return;
    }

    const payload = JSON.stringify({ ...savedMessage, clientId });

    // Deliver to the receiver and echo to the sender (across all of their open tabs).
    wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;

      const clientUserId = (client as any).userId;
      if (clientUserId === receiverId || clientUserId === senderId) {
        client.send(payload);
      }
    });
  });

  // socket.send("This is from Server...")
});

app.get("/health", (req, res) => {
  res.json({ Status: "ok" });
});

app.get("/users", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username FROM users WHERE id <> $1 ORDER BY username ASC",
      [res.locals.userId],
    );

    return res.json({
      status: "success",
      users: result.rows,
    });
  } catch (error) {
    console.log("Failed to list users", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to load users",
    });
  }
});

app.get("/messages/:userId", requireAuth, async (req, res) => {
  const otherUserId = Number(req.params.userId);

  if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
    return res.status(400).json({
      status: "error",
      message: "Invalid user id",
    });
  }

  const selfId = res.locals.userId as number;

  try {
    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, content, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC, id ASC
       LIMIT 500`,
      [selfId, otherUserId],
    );

    return res.json({
      status: "success",
      messages: result.rows,
    });
  } catch (error) {
    console.log("Failed to load conversation", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to load conversation",
    });
  }
});

app.post("/ws-ticket", requireAuth, (req, res) => {
  return res.json({
    status: "success",
    ticket: issueWsTicket(res.locals.userId as number),
  });
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

  const trimmedUsername = username.trim();

  try {
    const hash = await argon2.hash(password);
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [trimmedUsername, hash],
    );
    console.log("User", trimmedUsername, "Successfully registered!!");
    return res.status(201).json({
      status: "success",
      user: result.rows[0],
    });
  } catch (error) { 
    // 23505 = Postgres unique_violation (users.username must have a UNIQUE constraint). postgres automatically generates this error with this code of 23505 when we try to insert a simialr username. 
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "That username is already taken.",
      });
    }

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
