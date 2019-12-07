var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuRestaurantSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idRestaurant: String,
        name: String,
        introduce: String,
        image: String,
        price: Number,
        star: { type: Number, default: 0 },
        createDate: Date,
        status: { type: String, default: 'open' }
});

module.exports = mongoose.model('menuRestaurants', MenuRestaurantSchema);
