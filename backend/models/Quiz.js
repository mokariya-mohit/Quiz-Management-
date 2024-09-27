const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required.'],
    },
    answerChoices: {
        type: [String],
        required: [true, 'Answer choices are required.'],
        validate: {
            validator: function (val) {
                return val.length >= 2;
            },
            message: 'There must be at least two answer choices.',
        },
    },
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required.'],
        validate: {
            validator: function (value) {
                return this.answerChoices.includes(value);
            },
            message: 'Correct answer must be one of the answer choices.',
        },
    },
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required.'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    questions: [questionSchema],
});

module.exports = mongoose.model('Quiz', quizSchema);
