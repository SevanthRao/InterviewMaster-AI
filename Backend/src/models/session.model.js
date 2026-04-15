const mongoose = require("mongoose")

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity is required"]
    }
}, {
    _id: false
})

const sessionHistorySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false
})

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    resume: {
        type: String,
        required: [true, "Resume text is required"]
    },
    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },
    selfDescription: {
        type: String,
        required: [true, "Self description is required"]
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    skillGaps: [skillGapSchema],
    refinedResumeHtml: {
        type: String,
        default: ""
    },
    history: {
        type: [sessionHistorySchema],
        default: []
    }
}, {
    timestamps: true
})

const sessionModel = mongoose.model("Session", sessionSchema)

module.exports = sessionModel
