const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccountClient: String,
        friends: {
                idAccountFriend: String,
                status: String,
                createDate: Date,
        },
});

module.exports = mongoose.model('friends', FriendSchema);
