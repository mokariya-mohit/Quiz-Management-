// Centralized Error Handling Middleware
module.exports = (err, req, res, next) => {
    console.error(err.stack);

    // Mongoose Bad ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ success: false, message: messages });
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Duplicate field value entered.' });
    }

    // Default to 500 server error
    res.status(500).json({ success: false, message: 'Server Error.' });
};
