const userModel = require('../models/user.model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const tokenBlacklistModel = require("../models/blacklist.model")

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : ""
}

function normalizeUsername(username) {
    return typeof username === "string" ? username.trim() : ""
}

function createAuthToken(user) {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            tokenId: crypto.randomUUID()
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
}

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public 
 */
async function registerUserController(req, res) {
    try {
        const username = normalizeUsername(req.body.username)
        const email = normalizeEmail(req.body.email)
        const { password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                message: "Username must be at least 3 characters long"
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User with the same username or email already exists"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        const token = createAuthToken(user)

        res.cookie("token", token, COOKIE_OPTIONS)

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        // Handle Mongoose duplicate key error
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                message: `A user with that ${field} already exists`
            });
        }
        console.error("Register error:", err.message);
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name loginUserController
 * @description Login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const email = normalizeEmail(req.body.email)
        const { password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = createAuthToken(user)

        res.cookie("token", token, COOKIE_OPTIONS)
        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name logoutUserController
 * @description Logout a user by clearing the token cookie and adding the token to the blacklist
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (err) {
        console.error("Logout error:", err.message);
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @name getMeController
 * @description Get the details of the logged in user
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("GetMe error:", err.message);
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
