const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idFollowAccount: String,
        idFollowReceiver: String,
        date: Date,
        status: String
});

module.exports = mongoose.model('friends', friendSchema);
