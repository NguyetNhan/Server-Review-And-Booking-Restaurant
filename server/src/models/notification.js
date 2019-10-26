var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccount: String,
        idDetail: String,
        title: String,
        content: String,
        image: String,
        type: String,
        createDate: Date,
});

module.exports = mongoose.model('notifications', NotificationSchema);
