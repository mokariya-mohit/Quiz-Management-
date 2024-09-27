const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { body } = require('express-validator');

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes
 * @access  Public
 */
router.get('/', quizController.getAllQuizzes);

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get quiz by ID
 * @access  Public
 */
router.get('/:id', quizController.getQuizById);

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Submit quiz answers and calculate score
 * @access  Public
 */
router.post(
    '/:id/submit',
    [
        body('responses')
            .isArray({ min: 1 })
            .withMessage('Responses must be a non-empty array.'),
        body('responses.*.questionId')
            .isMongoId()
            .withMessage('Each response must have a valid questionId.'),
        body('responses.*.selectedAnswer')
            .notEmpty()
            .withMessage('Each response must have a selectedAnswer.'),
    ],
    quizController.submitQuiz
);

/**
 * @route   POST /api/quizzes
 * @desc    Add a new quiz
 * @access  Public
 */
router.post(
    '/',
    [
        body('title')
            .notEmpty()
            .withMessage('Quiz title is required.')
            .isString()
            .withMessage('Quiz title must be a string.'),
        body('description')
            .optional()
            .isString()
            .withMessage('Description must be a string.'),
        body('questions')
            .isArray({ min: 1 })
            .withMessage('Questions must be a non-empty array.'),
        body('questions.*.questionText')
            .notEmpty()
            .withMessage('Question text is required.')
            .isString()
            .withMessage('Question text must be a string.'),
        body('questions.*.answerChoices')
            .isArray({ min: 2 })
            .withMessage('Each question must have at least two answer choices.'),
        body('questions.*.correctAnswer')
            .notEmpty()
            .withMessage('Correct answer is required.')
            .isString()
            .withMessage('Correct answer must be a string.'),
        // Custom validation to ensure correctAnswer is one of the answerChoices
        body('questions').custom((questions) => {
            for (let question of questions) {
                if (!question.answerChoices.includes(question.correctAnswer)) {
                    throw new Error(
                        `Correct answer "${question.correctAnswer}" must be one of the answer choices for question "${question.questionText}".`
                    );
                }
            }
            return true;
        }),
    ],
    quizController.addQuiz
);

module.exports = router;
