const jwt = require('jsonwebtoken');
const TokenBlackListModel = require('../models/blackList.model');


async function authUserMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const blacklistedToken = await TokenBlackListModel.findOne({ token });
    if (blacklistedToken) {
        return res.status(401).json({ message: 'Token is blacklisted' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Normalize token payload to provide `req.user.id`
        req.user = { id: decoded.userId || decoded.id };
        next();
    } catch (error) {
        console.error('Error in authUserMiddleware:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = {authUserMiddleware};