const app = module.exports = require('express')();
const ModelOrder = require('../models/order');
const ModelNotification = require('../models/notification');
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');

app.get('/admin/:idAdmin/page/:page/filter/:filter', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: null,
                count_item: null,
                data: null
        };
        const idAdmin = req.params.idAdmin;
        const page = Number.parseInt(req.params.page);
        const filter = req.params.filter;
        try {
                const restaurant = await ModelRestaurant.findOne({ idAdmin: idAdmin });
                if (restaurant === null) {
                        format.error = true;
                        format.page = page;
                        format.message = 'ID quản trị viên nhà hàng bị sai !';
                        res.json(format);
                } else {
                        var options = {};
                        if (filter === 'waiting' || filter === 'activity' || filter === 'complete' || filter === 'review' || filter === 'cancel') {
                                options = {
                                        status: filter,
                                        idRestaurant: restaurant._id
                                };
                        } else {
                                options = {
                                        idRestaurant: restaurant._id
                                };
                        }
                        const countItem = await ModelOrder.countDocuments(options);
                        format.count_item = countItem;
                        let total_page = countItem / 10;
                        if (Number.isInteger(total_page)) {
                                format.total_page = total_page;
                        } else {
                                total_page = parseInt(total_page);
                                format.total_page = total_page + 1;
                        }
                        if (countItem === 0) {
                                format.error = true;
                                format.page = page;
                                format.message = 'Không có đơn hàng !';
                                res.json(format);
                        } else if (page > format.total_page || page === 0) {
                                format.error = true;
                                format.page = page;
                                format.message = 'Nhập số trang sai !';
                                res.json(format);
                        } else {
                                if (page === 1) {
                                        const resultOrder = await ModelOrder.find(options).sort({ createDate: -1 }).limit(10);
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                        } else {
                                                format.message = 'Không có đơn hàng !';
                                        }
                                        format.data = resultOrder;
                                        res.json(format);
                                } else {
                                        format.page = page;
                                        const resultOrder = await ModelOrder.find(options).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                        } else {
                                                format.message = 'Không có đơn hàng !';
                                        }
                                        format.data = resultOrder;
                                        res.json(format);
                                }
                        }
                }
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.get('/client/:idClient/page/:page/filter/:filter', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: null,
                count_item: null,
                data: null
        };
        const idClient = req.params.idClient;
        const page = Number.parseInt(req.params.page);
        const filter = req.params.filter;
        try {
                if (idClient === null) {
                        format.error = true;
                        format.page = page;
                        format.message = 'Mã ID khách hàng không được để trống !';
                        res.json(format);
                } else {
                        var options = {};
                        if (filter === 'waiting' || filter === 'activity' || filter === 'complete' || filter === 'review' || filter === 'cancel') {
                                options = {
                                        status: filter,
                                        idClient: idClient
                                };
                        } else {
                                options = {
                                        idClient: idClient
                                };
                        }
                        const countItem = await ModelOrder.countDocuments(options);
                        format.count_item = countItem;
                        let total_page = countItem / 10;
                        if (Number.isInteger(total_page)) {
                                format.total_page = total_page;
                        } else {
                                total_page = parseInt(total_page);
                                format.total_page = total_page + 1;
                        }
                        if (countItem === 0) {
                                format.error = true;
                                format.page = page;
                                format.message = 'Không có đơn hàng !';
                                res.json(format);
                        } else if (page > format.total_page || page === 0) {
                                format.error = true;
                                format.page = page;
                                format.message = 'Nhập số trang sai !';
                                res.json(format);
                        } else {
                                if (page === 1) {
                                        const resultOrder = await ModelOrder.find(options).sort({ createDate: -1 }).limit(10);
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                        } else {
                                                format.message = 'Không có đơn hàng !';
                                        }
                                        format.data = resultOrder;
                                        res.json(format);
                                } else {
                                        format.page = page;
                                        const resultOrder = await ModelOrder.find(options).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                        } else {
                                                format.message = 'Không có đơn hàng !';
                                        }
                                        format.data = resultOrder;
                                        res.json(format);
                                }
                        }
                }
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.get('/id/:idOrder', async (req, res) => {
        var format = {
                error: false,
                messages: '',
                data: null
        };
        const idOrder = req.params.idOrder;
        try {
                const results = await ModelOrder.findById(idOrder);
                if (results === null) {
                        format.error = true;
                        format.messages = 'Đơn hàng không tồn tại !';
                        format.data = null;
                        res.json(format);
                } else {
                        format.messages = 'ok';
                        format.data = results;
                        res.json(format);
                }
        } catch (error) {
                format.error = true;
                format.messages = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});


app.post('/add-order', async (req, res) => {
        var format = {
                error: false,
                messages: '',
                data: null
        };
        try {
                const data = {
                        idClient: req.body.idClient,
                        idRestaurant: req.body.idRestaurant,
                        customerName: req.body.customerName,
                        customerEmail: req.body.customerEmail,
                        customerPhone: Number.parseInt(req.body.customerPhone),
                        amountPerson: Number.parseInt(req.body.amountPerson),
                        food: req.body.food,
                        receptionTime: req.body.receptionTime,
                        totalMoney: Number.parseFloat(req.body.totalMoney),
                        totalMoneyFood: Number.parseFloat(req.body.totalMoneyFood),
                        discount: req.body.discount,
                        note: req.body.note,
                        status: 'waiting',
                        createDate: Date.now()
                };
                const results = await ModelOrder.create(data);
                if (results === null) {
                        format.error = true;
                        format.messages = 'Không thêm vào được!';
                        format.data = null;
                } else {
                        const restaurant = await ModelRestaurant.findById(results.idRestaurant);
                        const user = await ModelUser.findById(results.idClient);
                        const notification = {
                                idAccount: restaurant.idAdmin,
                                idOrder: results._id,
                                title: user.name,
                                content: 'đã đặt tiệc nhà hàng của bạn !',
                                image: null,
                                type: 'order',
                                createDate: Date.now()
                        };
                        await ModelNotification.create(notification);
                        format.messages = 'Đặt tiệc thành công !';
                        format.data = results;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.messages = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.put('/confirm-order/idAccount/:idAccount/idOrder/:idOrder/status/:status', async (req, res) => {
        var format = {
                error: false,
                messages: '',
                data: null
        };
        const idOrder = req.params.idOrder;
        const status = req.params.status;
        const idAccount = req.params.idAccount;
        try {
                const order = await ModelOrder.findById(idOrder);
                if (order === null) {
                        format.error = true;
                        format.messages = 'ID đơn hàng không chính xác !';
                } else {
                        const results = await ModelOrder.findByIdAndUpdate(idOrder, { $set: { status: status } }, { useFindAndModify: false });
                        if (results === null) {
                                format.error = true;
                                format.messages = 'ID đơn hàng không chính xác !';
                        } else {
                                const restaurant = await ModelRestaurant.findById(order.idRestaurant);
                                if (restaurant === null) {
                                        format.error = true;
                                        format.messages = 'Nhà hàng không tồn tại !';
                                } else {
                                        if (status === 'activity') {
                                                const notification = {
                                                        idAccount: results.idClient,
                                                        idOrder: results._id,
                                                        title: restaurant.name,
                                                        content: `Đơn hàng ID ${idOrder} đã được xác nhận !`,
                                                        image: restaurant.imageRestaurant[0],
                                                        type: 'order',
                                                        createDate: Date.now()
                                                };
                                                await ModelNotification.create(notification);
                                                format.messages = 'Đã xác nhận thành công !';
                                        } else if (status === 'cancel') {
                                                const accountAdmin = await ModelUser.findById(restaurant.idAdmin);
                                                const accountClient = await ModelUser.findById(order.idClient);
                                                if (idAccount === order.idClient) {
                                                        const notification = {
                                                                idAccount: accountAdmin._id,
                                                                idOrder: order._id,
                                                                title: order.customerName,
                                                                content: `Đã hủy đơn hàng ID ${idOrder} !`,
                                                                image: accountClient.avatar,
                                                                type: 'order',
                                                                createDate: Date.now()
                                                        };
                                                        await ModelNotification.create(notification);
                                                } else if (idAccount === restaurant.idAdmin) {
                                                        const notification = {
                                                                idAccount: accountClient._id,
                                                                idOrder: order._id,
                                                                title: restaurant.name,
                                                                content: `Không chấp nhận đơn hàng ID ${idOrder} của bạn !`,
                                                                image: restaurant.imageRestaurant[0],
                                                                type: 'order',
                                                                createDate: Date.now()
                                                        };
                                                        await ModelNotification.create(notification);
                                                }
                                                format.messages = 'Đã hủy thành công !';
                                        }
                                        format.data = results;
                                }
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.messages = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.put('/admin-restaurant/idAdmin/:idAdmin/confirm-order/idOrder/:idOrder', async (req, res) => {
        var format = {
                error: false,
                messages: '',
                data: null
        };
        const idOrder = req.params.idOrder;
        const idAdmin = req.params.idAdmin;
        try {
                const restaurant = await ModelRestaurant.findOne({ idAdmin: idAdmin });
                if (restaurant === null) {
                        format.error = true;
                        format.messages = 'Mã ID Admin không chính xác !';
                } else {
                        const order = await ModelOrder.findOne({ idRestaurant: restaurant._id, _id: idOrder });
                        if (order === null) {
                                format.error = true;
                                format.messages = 'Mã đơn hàng không tồn tại hoặc không chính xác !';
                        } else {
                                if (order.status === 'review') {
                                        format.error = true;
                                        format.messages = 'Đơn hàng đã được xác nhận trước đây !';
                                } else {
                                        const results = await ModelOrder.findOneAndUpdate({ idRestaurant: restaurant._id, _id: idOrder }, { $set: { status: 'review' } }, { useFindAndModify: false });
                                        if (results === null) {
                                                format.error = true;
                                                format.messages = 'Mã đơn hàng không tồn tại hoặc không chính xác !';
                                        } else {
                                                const percent = (order.totalMoneyFood * 5) / 100;
                                                const user = await ModelUser.findById(results.idClient);
                                                if (user !== null) {
                                                        const totalPercent = (Number.parseInt(percent)) + user.score;
                                                        await ModelUser.findByIdAndUpdate(results.idClient, { $set: { score: totalPercent } }, { useFindAndModify: false });
                                                }
                                                const notification = {
                                                        idAccount: results.idClient,
                                                        idOrder: results._id,
                                                        title: restaurant.name,
                                                        content: `Đơn hàng ID ${idOrder} đã hoàn thành, bạn nhận được ${Number.parseInt(percent)} điểm cộng từ giá trị đơn hàng, hãy cho chúng tôi biết nhận xét của bạn để cải thiện chất lượng tốt hơn !`,
                                                        image: restaurant.imageRestaurant[0],
                                                        type: 'order',
                                                        createDate: Date.now()
                                                };
                                                await ModelNotification.create(notification);
                                                format.messages = 'Xác nhận đơn hàng thành công !';
                                                format.data = results;
                                        }
                                }
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.messages = error.message;
                format.data = error;
                res.status(500).json(format);
        }

});

