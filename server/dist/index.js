import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
const app = express();
dotenv.config();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this IP. Please try again later",
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
});
// cors middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept",
    ],
}));
app.use(helmet());
// Apply the rate limiting middleware to api requests.
app.use("/api", limiter);
// logging middleware
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}
// Middleware to parse JSON request bodies
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// Routes
app.get("/", (req, res) => {
    res.json({ message: "Hello, World!" });
});
// error handling
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error("Stack:", err?.stack);
    res.status(err.status || 500).json({
        message: err.message || "Something went wrong",
        status: err.status || 500,
        success: err.success || false,
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
