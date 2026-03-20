const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


// Zod schema used for runtime validation
const interviewReportSchema = z.object({
    matchScore: z.number(),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
    title: z.string()
})

// Explicit JSON Schema sent to Gemini for structured output
const interviewReportJsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description",
        },
        technicalQuestions: {
            type: "array",
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" },
                },
                required: ["question", "intention", "answer"],
            },
            minItems: 1,
        },
        behavioralQuestions: {
            type: "array",
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" },
                },
                required: ["question", "intention", "answer"],
            },
            minItems: 1,
        },
        skillGaps: {
            type: "array",
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    skill: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                },
                required: ["skill", "severity"],
            },
        },
        preparationPlan: {
            type: "array",
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    day: { type: "number" },
                    focus: { type: "string" },
                    tasks: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },
        title: {
            type: "string",
            description: "A title for the interview report that summarizes the overall assessment of the candidate"
        }
    },
    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title"
    ],
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Return ONLY a JSON object that strictly follows the defined response schema. Do not include any extra fields, text, or explanations.`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: interviewReportJsonSchema,
        }
    })

    const raw = JSON.parse(response.text)

    // Validate against Zod schema so you immediately see if the
    // model ignored the structure we asked for.
    try {
        const parsed = interviewReportSchema.parse(raw)
        // Use console.dir so nested arrays like `tasks` are fully shown
        // console.dir(parsed, { depth: null })
        return parsed
    } catch (err) {
        console.log(err)
    }


}


module.exports = generateInterviewReport