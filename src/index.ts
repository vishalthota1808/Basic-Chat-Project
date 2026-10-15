import express from "express";
import { stat, Stats } from "node:fs";

const app = express();

//for middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat server is running");
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

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
