var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RestaurantSchema = new Schema({
        id: mongoose.Types.ObjectId,
        name: String,
        introduce: String,
        idAdmin: String,
        imageRestaurant: [String],
        phone: String,
        address: String,
        status: String,
        type: String,
        timeOpen: Number,
        timeClose: Number,
        createDate: Date,
        star: { type: Number, default: 0 },
        position: {
                latitude: Number,
                longitude: Number
        }
});

module.exports = mongoose.model('restaurants', RestaurantSchema);
