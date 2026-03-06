const pdfParse = require('pdf-parse');
const { generateInterviewReport } = require('../services/ai.service');
const interViewReportModel = require('../models/InterViewReport.model');


/**
 * @name generateInterviewReportController
 * @description Controller to generate interview report based on candidate's resume, self-description, and job description
 * @access Private
 * @param {*} req 
 * @param {*} res 
 */
async function generateInterviewReportController(req, res){
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        const {selfdescription, jobdescription} = req.body;

        if (!selfdescription || !jobdescription) {
            return res.status(400).json({ error: 'selfdescription and jobdescription are required' });
        }

        // Parse PDF properly
        const pdfData = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        const resumeText = pdfData.text;

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfdescription,
            jobdescription
        });

        const interViewReport = await interViewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfdescription,
            jobDescription: jobdescription,
            ...interViewReportByAi,
        })

        res.status(201).json({ 
            messege : "Interview report generated successfully", 
            interViewReport
        })
    } catch (error) {
        console.error('Error generating interview report:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * @name getInterviewReportController
 * @description Controller to get interview report by interviewId
 * @access Private
 * @param {*} req 
 * @param {*} res 
 */
async function getInterviewReportByIdController(req, res){
    try {
        const { interviewId } = req.params;
        const interViewReport = await interViewReportModel.findById({ _id: interviewId , user: req.user.id });
        if (!interViewReport) {
            return res.status(404).json({ error: 'Interview report not found' });
        }
        res.status(200).json({
            messege : "Interview report retrieved successfully", 
            interViewReport
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * @name getAllInterviewReportController
 * @description Controller to get all interview reports of logged in user
 * @access Private
 * @param {*} req 
 * @param {*} res 
 */

async function getAllInterviewReportController(req, res){
    try {
        const interViewReports = await interViewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select('-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan');
        res.status(200).json({
            messege : "Interview reports retrieved successfully", 
            interViewReports
        });
        } catch (error) {
           console.log(error);
           res.status(500).json({ error: error.message });
        }
}


module.exports = { generateInterviewReportController , getInterviewReportByIdController , getAllInterviewReportController };