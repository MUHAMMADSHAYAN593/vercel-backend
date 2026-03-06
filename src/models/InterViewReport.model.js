const mongoose = require('mongoose');

/**
 * @description This schema defines the structure of the Interview Report document in MongoDB.
 * - job description Schema : string
 * - resume text : string
 * - self description : string
 * 
 * - match score : number
 * 
 * - Technical questions : 
 *     [{
 *       question: String,
 *      inntention: String, 
 *      answer: String,
 * }]
 * - Behavioral questions : [{
 *       question: String,
 *      inntention: String, 
 *      answer: String,
 * }]
 * - Skill gaps : [{
 *       skill: String,
 *      severity: {String, enum: ['low', 'medium', 'high']}, 
 *
 * }]
 * - prepration plan : [{
 *       day: number,
 *      focus: String, 
 *      tasks: [String],
 * }]
 */

const TechnicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"],
    },
    intention: {
        type: String,
        required: [true, "Intention is required"],
    },
    answer: {
        type: String,
        required: [true, "Answer is required"],
    },
} , { _id: false });

const BehavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"],
    },
    intention: {
        type: String,
        required: [true, "Intention is required"],
    },
    answer: {
        type: String,
        required: [true, "Answer is required"],
    },
} , { _id: false });

const SkillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"],
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, "Severity is required"],
    },
} , { _id: false });

const PreparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"],
    },
    focus: {
        type: String,
        required: [true, "Focus is required"],
    },
    tasks: {
        type: [String],
        required: [true, "Tasks are required"],
    },
} , { _id: false });


const InterviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is required"],    
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [TechnicalQuestionSchema],
    behavioralQuestions: [BehavioralQuestionSchema],
    skillGaps: [SkillGapSchema],
    preparationPlan: [PreparationPlanSchema],
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }, 
    tittle: {
        type: String,
        required: [true, "Tittle is required"],
    }
}, { timestamps: true });

const InterviewReport = mongoose.model('InterviewReport', InterviewReportSchema);

module.exports = InterviewReport;


