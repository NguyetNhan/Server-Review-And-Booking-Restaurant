const app = module.exports = require('express')();
const ModelDiscount = require('../models/discount');
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');
const lodash = require('lodash');


app.get('/idDiscount/:idDiscount', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const idDiscount = req.params.idDiscount;

        try {
                const result = await ModelDiscount.findById(idDiscount);
                if (result === null) {
                        format.error = true;
                        format.message = 'Chương trình khuyến mãi không tồn tại !';
                } else {
                        format.message = 'ok';
                        format.data = result;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});
app.post('/create-discount', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const body = {
                name: req.body.name,
                createDate: Date.now(),
                endDate: req.body.endDate,
                amount: req.body.amount,
                idRestaurant: req.body.idRestaurant,
                percent: req.body.percent,
        };
        try {
                const result = await ModelDiscount.create(body);
                if (result === null) {
                        format.error = true;
                        format.message = 'Không tạo được khuyến mãi !';
                } else {
                        format.data = result;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.put('/add-discount-client/idDiscount/:idDiscount/idAccount/:idAccount', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const idDiscount = req.params.idDiscount;
        const idAccount = req.params.idAccount;
        try {
                const discount = await ModelDiscount.findById(idDiscount);
                if (discount === null) {
                        format.error = true;
                        format.message = 'Khuyến mãi không tồn tại !';
                } else {
                        let idClientList = discount.idClient;
                        if (idClientList.length === discount.amount) {
                                format.message = 'Mã khuyến mãi đã được săn hết !';
                        } else {
                                let checkExist = false;
                                for (item of idClientList) {
                                        if (item === idAccount) {
                                                checkExist = true;
                                                break;
                                        }
                                }
                                if (checkExist) {
                                        format.message = 'Bạn đã nhận mã khuyến mãi rồi !';
                                } else {
                                        const restaurant = await ModelRestaurant.findById(discount.idRestaurant);
                                        if (restaurant === null) {
                                                format.error = true;
                                                format.message = 'Nhà hàng không tồn tại !';
                                        } else {
                                                if (restaurant.idAdmin === idAccount) {
                                                        format.message = 'Tài khoản quản trị nhà hàng không được phép tham gia chương trình khuyến mãi !';
                                                } else {
                                                        idClientList.push(idAccount);
                                                        const user = await ModelUser.findById(idAccount);
                                                        if (user === null) {
                                                                format.error = true;
                                                                format.message = 'Tài khoản không tồn tại !';
                                                        } else {
                                                                const userDiscount = user.discount;
                                                                let checkUserDiscountExist = false;
                                                                for (item of userDiscount) {
                                                                        if (item === idDiscount) {
                                                                                checkUserDiscountExist = true;
                                                                                break;
                                                                        }
                                                                }
                                                                if (checkUserDiscountExist) {
                                                                        format.message = 'Bạn đã nhận mã khuyến mãi rồi !';
                                                                } else {
                                                                        userDiscount.push(idDiscount);
                                                                        const resultUpdateUser = await ModelUser.updateOne({ _id: idAccount }, { discount: userDiscount });
                                                                        const resultUpdateDiscount = await ModelDiscount.updateOne({ _id: idDiscount }, { idClient: idClientList });
                                                                        if (resultUpdateDiscount.ok === 1) {
                                                                                format.message = `Bạn đã nhận được mã khuyến mãi của nhà hàng ${restaurant.name} !`;
                                                                        }
                                                                }
                                                        }
                                                }
                                        }
                                }
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});