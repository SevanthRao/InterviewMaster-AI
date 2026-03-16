const userModel = require('../models/user.model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model")


/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public 
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    // Validate the input
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide all required fields"
        });
    }

    // Check if the user already exists
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with the same username or email already exists"
        });
    }

    // Hash the password before saving to the database
    const hash = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await userModel.create({
        username,
        email,
        password: hash
    });

    // Generate a JWT token for the user based on their id and username
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    // Set the token in the response cookie
    res.cookie("token", token)

    // Send the response with the user details (excluding the password) and the token
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @description Login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    // Check if the user exists in the database based on the email
    const user = await userModel.findOne({ email });

    // if not user found, send an error response
    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    // Compare the provided password with the hashed password stored in the database using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name logoutUserController
 * @description Logout a user by clearing the token cookie and adding the token to the blacklist
 * @access Public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (token) {
        await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token");

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description Get the details of the logged in user
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);
    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}