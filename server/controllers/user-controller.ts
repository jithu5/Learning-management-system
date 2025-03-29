import { Request, Response } from "express";
import { AsyncHandler, ApiError } from "../middlewares/error.middlewares.js";
import { User } from "../models/user.model.js";

export const createUserAccount = AsyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role = "student" } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }
  } catch (error: any) {
    throw new ApiError(error.statusCode, error.message);
  }
});
