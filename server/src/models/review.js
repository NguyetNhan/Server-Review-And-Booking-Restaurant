const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
        id: mongoose.Types.ObjectId,
        type: String,
        idReviewAccount: String,
        idReviewReceiver: String,
        imageReview: [String],
        content: String,
        score: Number,
        date: Date,
});

module.exports = mongoose.model('reviews', reviewSchema);
