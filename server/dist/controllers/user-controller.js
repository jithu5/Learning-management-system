import { AsyncHandler, ApiError } from "../middlewares/error.middlewares.js";
import { User } from "../models/user.model.js";
export const createUserAccount = AsyncHandler(async (req, res) => {
    const { name, email, password, role = "student" } = req.body;
    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new ApiError(400, "Email already exists");
        }
    }
    catch (error) {
        throw new ApiError(error.statusCode, error.message);
    }
});
