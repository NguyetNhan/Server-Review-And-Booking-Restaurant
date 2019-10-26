const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InviteSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccountClient: String,
        idAccountInvite: String,
        idRestaurant: String,
        idOrder: String,
        receptionTime: Date,
        createDate: Date,
        status: { type: String, default: 'waiting' }
});

module.exports = mongoose.model('invites', InviteSchema);
