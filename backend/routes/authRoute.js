import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authRouter = express.Router();

const ALLOWED_ROLES = new Set(["student", "faculty"]);

function normalizeRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return normalized;
}

function signToken(userId, role) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is not set");
    err.code = "JWT_SECRET_MISSING";
    throw err;
  }

  return jwt.sign({ sub: userId, role }, secret, { expiresIn: "7d" });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedRole = normalizeRole(role);
    if (!normalizedRole || !ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json({ error: "Role must be either 'student' or 'faculty'" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
    });

    return res.status(201).json({
      message: "Registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Email is already registered" });
    }
    return res.status(500).json({ error: err.message || "Registration failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userRole = user.role || "student";
    const requestedRole = normalizeRole(role);
    if (requestedRole) {
      if (!ALLOWED_ROLES.has(requestedRole)) {
        return res.status(400).json({ error: "Role must be either 'student' or 'faculty'" });
      }
    }

    const token = signToken(user._id.toString(), userRole);

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: userRole },
    });
  } catch (err) {
    if (err?.code === "JWT_SECRET_MISSING") {
      return res.status(500).json({ error: "Server auth is not configured (missing JWT_SECRET)" });
    }
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});
