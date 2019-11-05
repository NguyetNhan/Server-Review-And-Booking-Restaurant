const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountSchema = new Schema({
        id: mongoose.Types.ObjectId,
        name: String,
        createDate: Date,
        endDate: Date,
        amount: Number,
        idRestaurant: String,
        percent: Number,
        idClient: [String]
});

module.exports = mongoose.model('discounts', DiscountSchema);
