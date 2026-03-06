const express = require('express');
const authController = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const authRouter = express.Router();


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */

authRouter.post('/register' , authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */

authRouter.post('/login' , authController.loginUserController);

/**
 * @route POST /api/auth/logout
 * @desc Logout a user by clearing the JWT token cookie and blacklisting the token on the client side
 * @access Public
 */

authRouter.get('/logout' , authController.logoutUserController);


/** * @route GET /api/auth/get-me
 * @desc Get the currently logged in user's information by verifying the JWT token from the cookie
 * @access private
 */

authRouter.get('/get-me' , authMiddleware.authUserMiddleware , authController.getMeController);



module.exports = authRouter;