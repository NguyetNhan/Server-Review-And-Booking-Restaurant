const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccountFollow: String,
        idRestaurantFollow: String,
        createDate: Date,
});

module.exports = mongoose.model('follows', FollowSchema);
