var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccount: String,
        idRestaurant: String,
        title: String,
        content: String,
        image: String,
        type: String,
        time: Date
});

module.exports = mongoose.model('notifications', notificationSchema);
