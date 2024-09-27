const Quiz = require('../models/Quiz');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all quizzes
 * @route   GET /api/quizzes
 * @access  Public
 */
exports.getAllQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find().select('title description');
        res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get quiz by ID
 * @route   GET /api/quizzes/:id
 * @access  Public
 */
exports.getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id).select('-__v');
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found.' });
        }
        res.status(200).json({ success: true, data: quiz });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit quiz answers and calculate score
 * @route   POST /api/quizzes/:id/submit
 * @access  Public
 */
exports.submitQuiz = async (req, res, next) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { responses } = req.body;
        const quizId = req.params.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found.' });
        }

        let score = 0;
        const totalQuestions = quiz.questions.length;

        // Create a map for quick lookup of correct answers
        const correctAnswersMap = {};
        quiz.questions.forEach((question) => {
            correctAnswersMap[question._id.toString()] = question.correctAnswer;
        });

        // Validate responses and calculate score
        responses.forEach((response) => {
            const { questionId, selectedAnswer } = response;
            const correctAnswer = correctAnswersMap[questionId];

            if (correctAnswer && selectedAnswer === correctAnswer) {
                score += 1;
            }
            // You can handle invalid questionIds or incorrect formats here if needed
        });

        res.status(200).json({
            success: true,
            data: {
                score,
                totalQuestions,
                percentage: ((score / totalQuestions) * 100).toFixed(2),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a new quiz
 * @route   POST /api/quizzes
 * @access  Public
 */
exports.addQuiz = async (req, res, next) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { title, description, questions } = req.body;

        // Create a new quiz
        const newQuiz = new Quiz({
            title,
            description,
            questions,
        });

        // Save to database
        const savedQuiz = await newQuiz.save();

        res.status(201).json({ success: true, data: savedQuiz });
    } catch (error) {
        next(error);
    }
};
