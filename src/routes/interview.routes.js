const express = require('express');
const InterviewRouter = express.Router();
const aiService = require('../services/ai.service');
const authMiddleware = require('../middleware/auth.middleware');
const authinterviewcontroller = require('../controller/interview.controller');
const upload = require('../middleware/file.middleware');


/**
 * @route POST /api/interview/report
 * @desc Generate interview report based on candidate's resume, self-description, and job description
 * @access Private
 */
InterviewRouter.post('/', authMiddleware.authUserMiddleware, upload.single('resume'), authinterviewcontroller.generateInterviewReportController);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId
 * @access Private
 */
InterviewRouter.get('/report/:interviewId', authMiddleware.authUserMiddleware, authinterviewcontroller.getInterviewReportByIdController);

/**
 * @route GET /api/interview
 * @description get all reports of logged in user
 * @acess private
 */

InterviewRouter.get('/', authMiddleware.authUserMiddleware , authinterviewcontroller.getAllInterviewReportController)

module.exports = InterviewRouter;