const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// Require all the routes here
const authRouter = require("./routes/auth.routes");
const sessionRouter = require("./routes/session.routes");
const interviewRouter = require("./routes/interview.routes");
const aptitudeRouter = require("./routes/aptitude.routes");
const technicalRouter = require("./routes/technical.routes");

// using all the routes here
app.use("/api/auth", authRouter);
app.use("/api/session", sessionRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/aptitude", aptitudeRouter);
app.use("/api/technical", technicalRouter);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

// Global error handler for multer, JSON parse errors, and other middleware errors
app.use((err, req, res, next) => {
    // Handle multer errors
    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Maximum size is 3MB." })
        }
        return res.status(400).json({ message: err.message })
    }

    if (err.message === "Only PDF files are allowed") {
        return res.status(400).json({ message: err.message })
    }

    // Handle JSON syntax errors (malformed request body)
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON in request body" })
    }

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "Origin is not allowed by CORS policy" })
    }

    console.error("Unhandled error:", err.message);
    res.status(500).json({ message: "Internal server error" })
});


module.exports = app;
