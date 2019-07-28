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
});

module.exports = mongoose.model('users', userSchema);
