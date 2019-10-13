const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DiscountSchema = new Schema({
        name: String,
        score: Number,
        type: String,
});
const OrderSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idClient: String,
        idRestaurant: String,
        customerName: String,
        customerEmail: String,
        customerPhone: Number,
        amountPerson: Number,
        food: [{
                idFood: String,
                amount: Number
        }],
        receptionTime: Date,
        note: String,
        status: String,
        review: Boolean,
        totalMoneyFood: Number,
        totalMoney: Number,
        discount: DiscountSchema,
        createDate: Date,
});

module.exports = mongoose.model('orders', OrderSchema);
