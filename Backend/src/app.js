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


module.exports = app;
