var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var menuRestaurantSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idRestaurant: String,
        name: String,
        introduce: String,
        image: String,
        price: Number,
        date_add: Date
});

module.exports = mongoose.model('menu-restaurants', menuRestaurantSchema);
