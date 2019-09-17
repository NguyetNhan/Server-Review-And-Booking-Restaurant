var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idClient: String,
        idRestaurant: String,
        customerName: String,
        customerEmail: String,
        customerPhone: Number,
        amountPerson: Number,
        food: [String],
        receptionTime: Date,
        orderTime: Date,
        totalMoney: Number,
        note: String,
        status: String,
});

module.exports = mongoose.model('orders', orderSchema);
