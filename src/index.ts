import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Chat server is running");
});

app.get("/health", (req, res) => {
  res.json({ Status: "ok" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
