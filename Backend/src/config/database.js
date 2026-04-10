const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to Database successfully");
    }
    catch (err) {
        console.error("Failed to connect to Database:", err.message);
        throw err; // Re-throw so server.js can handle it
    }
}

module.exports = connectDB;