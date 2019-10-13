const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idConversation: String,
        idSender: String,
        content: String,
        seen: { type: Boolean, default: false },
        image: [String],
        createDate: Date,
});

module.exports = mongoose.model('messages', MessageSchema);
