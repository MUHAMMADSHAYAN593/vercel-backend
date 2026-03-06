const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

/**
 * Importing Routes
 */
const authRouter = require('./routes/auth.route');
const interviewRouter = require('./routes/interview.routes');


const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
))

/**
 * Using Routes
 */

app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);

module.exports = app;