const Review = require('./../models/reviewModel')
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')

exports.checkIfAuthor = async (req, res, next) => {
    const review = await Review.findById(req.params.id)
    if (req.user.role !== 'admin') {
        if (review.author.id !== req.user.id) return next(new AppError(`You cannot edit someone's else review.`, 401));
    }
    next();
};


exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.author = req.user.id
    next()
}

exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);