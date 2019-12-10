const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DiscountSchema = new Schema({
        name: String,
        value: Number,
        type: String,
        idDiscount: { type: String, default: null }
});
const GuestsSchema = new Schema({
        name: String,
        idAccount: String,
});
const OrderSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idClient: String,
        idRestaurant: String,
        customerName: String,
        customerEmail: String,
        customerPhone: String,
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
        guests: [GuestsSchema]
});

module.exports = mongoose.model('orders', OrderSchema);
