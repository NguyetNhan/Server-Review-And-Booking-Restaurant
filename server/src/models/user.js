var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
        id: mongoose.Types.ObjectId,
        name: String,
        email: { type: String, lowercase: true, unique: true },
        password: String,
        avatar: String,
        phone: Number,
        authorities: String,
        score: Number,
        conversation: [{
                idConversation: String,
                idUserReceiver: String,
                createDate: Date,
        }],
        createDate: Date
});

module.exports = mongoose.model('users', UserSchema);
