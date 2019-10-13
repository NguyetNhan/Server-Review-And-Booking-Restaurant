const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
        id: mongoose.Types.ObjectId,
        participant: [String],
        createDate: Date,
        updateDate: Date
});

module.exports = mongoose.model('conversations', ConversationSchema);
