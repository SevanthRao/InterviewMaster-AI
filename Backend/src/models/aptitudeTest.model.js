const mongoose = require("mongoose")

const aptitudeQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    userAnswer: {
        type: Number,
        default: -1
    },
    explanation: {
        type: String,
        required: true
    }
}, {
    _id: false
})

const aptitudeTestSchema = new mongoose.Schema({
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
    timeLimit: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    questions: [aptitudeQuestionSchema],
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

const aptitudeTestModel = mongoose.model("AptitudeTest", aptitudeTestSchema)

module.exports = aptitudeTestModel
