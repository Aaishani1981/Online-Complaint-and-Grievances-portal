const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const usersFile = path.join(__dirname, "../data/users.json");

// Signup
router.post("/signup", (req, res) => {
  const { email, password } = req.body;

  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
  }

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ email, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: "Signup successful! Redirecting to complaint portal..." });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!fs.existsSync(usersFile)) {
    return res.status(400).json({ message: "No users found" });
  }

  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  res.json({ message: "Login successful! Redirecting to complaint portal..." });
});

module.exports = router;
