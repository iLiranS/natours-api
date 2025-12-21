// rating, createdAt ,ref to tour , ref to user
const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'review cannot be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId(),
            ref: 'Tour',
            required: [true, 'review must have associated tour']
        },
        author: {
            type: mongoose.Schema.ObjectId(),
            ref: 'User',
            required: [true, 'review must have an author']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review