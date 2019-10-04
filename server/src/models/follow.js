const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccountFollow: String,
        idRestaurantFollow: String,
        date: Date,
});

module.exports = mongoose.model('follows', followSchema);
