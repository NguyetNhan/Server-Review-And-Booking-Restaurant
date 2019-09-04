var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
        id: mongoose.Types.ObjectId,
        name: String,
        email: String,
        password: String,
        image: String,
        phone: Number,
        authorities: String,
        date_register: Date
});

module.exports = mongoose.model('users', userSchema);
