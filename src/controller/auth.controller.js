const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TokenBlackListModel = require('../models/blackList.model');


/**
 * @name registerUserController
 * @description Controller to handle user registration expected to receive username, email and password in the request body
 * @access Public
 * @param {*} req 
 * @param {*} res 
 */
async function registerUserController(req, res) {
    try{
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required.' });
        }
        // Check if the user already exists
        const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash the password        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save a new user
        const newUser = new userModel({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();

        const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);

        res.status(201).json({ message: 'User registered successfully.', user: { 
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
         } });


    } catch (error) {
        console.error('Error in registerUserController:', error);
        res.status(500).json({ message: 'Internal Server Error:'});
    }
}

/**
 * @name loginUserController
 * @description Controller to handle user login expected to receive email and password in the request body
 * @access Public
 * @param {*} req 
 * @param {*} res 
 */

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        // Check if the user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }   

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);

        res.status(200).json({ message: 'Login successful.', user: { 
            id: user._id,
            username: user.username,
            email: user.email,
         } });
    } catch (error) {
        console.error('Error in loginUserController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


/**
 * @name logoutUserController
 * @description Controller to handle user logout expected to blacllist the JWT token on the client side by clearing the cookie
 * @access Public
 * @param {*} req 
 * @param {*} res 
 */
async function logoutUserController(req, res) {
    try{
        const token = req.cookies.token;
        if (token) {
            await TokenBlackListModel.create({ token });
        }
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful.' });
    } catch (error) {
        console.error('Error in logoutUserController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

/**
 * @name getMeController
 * @description Controller to get the currently logged in user's information expected to verify the JWT token from the cookie and return the user's information
 * @access Private
 * @param {*} req 
 * @param {*} res 
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(200).json({ 
            message:'User information retrieved successfully.', 
            user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Error in getMeController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
