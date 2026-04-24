require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");


// Connect to the database, then start the server
connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}).catch((err) => {
    console.error("Failed to start server due to DB connection error:", err.message);
    process.exit(1);
})

