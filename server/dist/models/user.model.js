import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowecase: true,
        match: [
            /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ["admin", "student", "instructor"],
            message: "Invalid role. Must be 'admin', 'student', or 'instructor'",
        },
        default: "student",
    },
    avatar: {
        type: String,
        default: "default-avatar.png",
    },
    bio: {
        type: String,
        maxLength: [200, "Bio cannot exceed 200 characters"],
    },
    enrolledCourses: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
            enrolledAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdCourses: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpiration: {
        type: Date,
    },
    lastAcive: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// password hashing before updating or saving to database
userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        const hashedPassword = await bcrypt.hash(user.password, 11);
        user.password = hashedPassword;
    }
    next();
});
// compare password with hashed password in database
userSchema.methods.comparePassword = async function (password) {
    const user = this;
    return await bcrypt.compare(password, user.password);
};
// generate token for password reset
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordTokenExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};
// update users last active
userSchema.methods.updateLastActive = function () {
    this.lastAcive = Date.now();
    return this.lastAcive({ validateBeforeSave: false });
};
// virtual field for total enrolled courses
userSchema.virtual("totalEnrolledCourses").get(function () {
    return this.enrolledCourses.length;
});
export const User = mongoose.model("User", userSchema);
