import { response } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key";

// Function to generate a JWT token
export function generateToken(res, user, message) {
  const token = jwt.sign({ userId: user?._id }, SECRET_KEY, {
    expiresIn: "7d",
  });
  return response
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    .json({
      message,
      success: true,
      user,
      token,
    });
}

// Function to verify a JWT token
export function verifyToken() {}
