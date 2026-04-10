const mongoose = require("mongoose")

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        default: ""
    },
    isCorrect: {
        type: Boolean,
        default: null
    },
    explanation: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        default: "basic"
    }
}, {
    _id: false
})

const technicalTestSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    questions: [technicalQuestionSchema],
    score: {
        type: Number,
        default: null
    },
    submitted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

const technicalTestModel = mongoose.model("TechnicalTest", technicalTestSchema)

module.exports = technicalTestModel
