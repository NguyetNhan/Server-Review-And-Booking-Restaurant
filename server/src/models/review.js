const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
        id: mongoose.Types.ObjectId,
        type: String,
        idReviewAccount: String,
        idReviewReceiver: String,
        imageReview: [String],
        content: String,
        score: Number,
        createDate: Date,
});

module.exports = mongoose.model('reviews', ReviewSchema);
