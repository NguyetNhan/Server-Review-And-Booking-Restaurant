var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var restaurantSchema = new Schema({
        id: mongoose.Types.ObjectId,
        name: String,
        introduce: String,
        idAdmin: String,
        imageRestaurant: [String],
        phone: Number,
        address: String,
        status: String,
        type: String,
        time_activity: String,
        date_register: Date,
        position: {
                latitude: Number,
                longitude: Number
        }
});

module.exports = mongoose.model('restaurants', restaurantSchema);
