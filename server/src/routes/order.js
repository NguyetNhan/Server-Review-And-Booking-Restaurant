const app = module.exports = require('express')();
const ModelOrder = require('../models/order');
const ModelNotification = require('../models/notification');
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');
const ModelInvite = require('../models/invite');

app.get('/admin/:idAdmin/page/:page/filter/:filter', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: null,
                count_item: null,
                data: []
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
                                        const dateNow = Date.now();
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                                for (order of resultOrder) {
                                                        const receptionTime = new Date(order.receptionTime);
                                                        if (dateNow > receptionTime) {
                                                                if (order.status === 'waiting' || order.status === 'activity') {
                                                                        order.status = 'cancel';
                                                                        await ModelOrder.updateOne({ _id: order._id }, { status: 'cancel' });
                                                                }
                                                        }
                                                }
                                        } else {
                                                format.message = 'Không có đơn hàng !';
                                        }
                                        format.data = resultOrder;
                                        res.json(format);
                                } else {
                                        format.page = page;
                                        const resultOrder = await ModelOrder.find(options).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
                                        const dateNow = Date.now();
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                                for (order of resultOrder) {
                                                        const receptionTime = new Date(order.receptionTime);
                                                        if (dateNow > receptionTime) {
                                                                if (order.status === 'waiting' || order.status === 'activity') {
                                                                        order.status = 'cancel';
                                                                        await ModelOrder.updateOne({ _id: order._id }, { status: 'cancel' });
                                                                }
                                                        }
                                                }
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
                data: []
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
                                        const dateNow = Date.now();
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                                for (order of resultOrder) {
                                                        const receptionTime = new Date(order.receptionTime);
                                                        if (dateNow > receptionTime) {
                                                                if (order.status === 'waiting' || order.status === 'activity') {
                                                                        order.status = 'cancel';
                                                                        await ModelOrder.updateOne({ _id: order._id }, { status: 'cancel' });
                                                                }
                                                        }
                                                }
                                        } else {
                                                format.message = 'Không có đơn hàng !';
                                        }
                                        format.data = resultOrder;
                                        res.json(format);
                                } else {
                                        format.page = page;
                                        const resultOrder = await ModelOrder.find(options).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
                                        const dateNow = Date.now();
                                        if (resultOrder.length > 0) {
                                                format.message = 'Thành công !';
                                                for (order of resultOrder) {
                                                        const receptionTime = new Date(order.receptionTime);
                                                        if (dateNow > receptionTime) {
                                                                if (order.status === 'waiting' || order.status === 'activity') {
                                                                        order.status = 'cancel';
                                                                        await ModelOrder.updateOne({ _id: order._id }, { status: 'cancel' });
                                                                }
                                                        }
                                                }
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
                let data = {};
                if (req.body.discount !== null) {
                        if (req.body.discount.type === 'score') {
                                data = {
                                        idClient: req.body.idClient,
                                        idRestaurant: req.body.idRestaurant,
                                        customerName: req.body.customerName,
                                        customerEmail: req.body.customerEmail,
                                        customerPhone: req.body.customerPhone,
                                        amountPerson: Number.parseInt(req.body.amountPerson),
                                        food: req.body.food,
                                        receptionTime: req.body.receptionTime,
                                        totalMoney: Number.parseFloat(req.body.totalMoney),
                                        totalMoneyFood: Number.parseFloat(req.body.totalMoneyFood),
                                        discount: {
                                                name: 'Sử dụng ' + req.body.discount.value + ' điểm tích lũy',
                                                value: req.body.discount.value,
                                                type: 'score',
                                        },
                                        note: req.body.note,
                                        status: 'waiting',
                                        createDate: Date.now(),
                                        guests: req.body.guests
                                };
                        } else {
                                data = {
                                        idClient: req.body.idClient,
                                        idRestaurant: req.body.idRestaurant,
                                        customerName: req.body.customerName,
                                        customerEmail: req.body.customerEmail,
                                        customerPhone: req.body.customerPhone,
                                        amountPerson: Number.parseInt(req.body.amountPerson),
                                        food: req.body.food,
                                        receptionTime: req.body.receptionTime,
                                        totalMoney: Number.parseFloat(req.body.totalMoney),
                                        totalMoneyFood: Number.parseFloat(req.body.totalMoneyFood),
                                        discount: req.body.discount,
                                        note: req.body.note,
                                        status: 'waiting',
                                        createDate: Date.now(),
                                        guests: req.body.guests
                                };
                        }
                } else {
                        data = {
                                idClient: req.body.idClient,
                                idRestaurant: req.body.idRestaurant,
                                customerName: req.body.customerName,
                                customerEmail: req.body.customerEmail,
                                customerPhone: req.body.customerPhone,
                                amountPerson: Number.parseInt(req.body.amountPerson),
                                food: req.body.food,
                                receptionTime: req.body.receptionTime,
                                totalMoney: Number.parseFloat(req.body.totalMoney),
                                totalMoneyFood: Number.parseFloat(req.body.totalMoneyFood),
                                discount: null,
                                note: req.body.note,
                                status: 'waiting',
                                createDate: Date.now(),
                                guests: req.body.guests
                        };
                }

                const results = await ModelOrder.create(data);
                if (results === null) {
                        format.error = true;
                        format.messages = 'Không thêm vào được!';
                        format.data = null;
                } else {
                        const restaurant = await ModelRestaurant.findById(results.idRestaurant);
                        const user = await ModelUser.findById(results.idClient);
                        if (data.discount !== null) {
                                if (data.discount.type === 'score') {
                                        await ModelUser.updateOne({ _id: results.idClient }, { $set: { score: user.score - req.body.discount.value } });
                                } else {
                                        const idDiscount = data.discount.idDiscount;
                                        let discountUser = user.discount;
                                        let position = null;
                                        for (let i = 0; i < discountUser.length; i++) {
                                                if (discountUser[i] === idDiscount)
                                                        position = i;
                                        }
                                        if (position !== null) {
                                                discountUser.splice(position, 1);
                                        }
                                        await ModelUser.updateOne({ _id: results.idClient }, { $set: { discount: discountUser } });
                                }
                        }
                        const notification = {
                                idAccount: restaurant.idAdmin,
                                idDetail: results._id,
                                title: user.name,
                                content: 'đã đặt tiệc nhà hàng của bạn !',
                                image: user.avatar,
                                type: 'order',
                                createDate: Date.now()
                        };
                        await ModelNotification.create(notification);
                        const date = new Date(data.receptionTime);
                        const convertTime = `${date.getHours()}h ${date.getMinutes()}''`;
                        const convertDate = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
                        for (item of data.guests) {
                                await ModelInvite.create({
                                        idAccountClient: item.idAccount,
                                        idAccountInvite: results.idClient,
                                        idRestaurant: restaurant._id,
                                        receptionTime: data.receptionTime,
                                        idOrder: results._id,
                                        createDate: Date.now(),
                                });
                                const notification = {
                                        idAccount: item.idAccount,
                                        idDetail: restaurant._id,
                                        title: user.name,
                                        content: `đã mời bạn đến tham gia buổi tiệc tại ${restaurant.name} lúc ${convertTime} ngày ${convertDate}!`,
                                        image: user.avatar,
                                        type: 'restaurant',
                                        createDate: Date.now()
                                };
                                await ModelNotification.create(notification);
                        }
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
                                                        idDetail: results._id,
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
                                                                idDetail: order._id,
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
                                                                idDetail: order._id,
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
                                                        idDetail: results._id,
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

app.put('/update-order/idOrder/:idOrder', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const idOrder = req.params.idOrder;
        let body = {
                guests: req.body.guests,
                food: req.body.food,
                customerName: req.body.customerName,
                customerEmail: req.body.customerEmail,
                customerPhone: req.body.customerPhone,
                amountPerson: req.body.amountPerson,
                receptionTime: req.body.receptionTime,
                note: req.body.note,
                totalMoneyFood: req.body.totalMoneyFood,
                totalMoney: req.body.totalMoney,
        };
        try {
                const resultOrder = await ModelOrder.findById(idOrder);
                if (resultOrder === null) {
                        format.error = true;
                        format.message = 'Đơn hàng không tồn tại !';
                } else {
                        const resultUpdate = await ModelOrder.updateOne({ _id: idOrder }, body);
                        if (resultUpdate.ok === 1) {
                                const user = await ModelUser.findById(resultOrder.idClient);
                                const restaurant = await ModelRestaurant.findById(resultOrder.idRestaurant);
                                const date = new Date(body.receptionTime);
                                const convertTime = `${date.getHours()}h ${date.getMinutes()}''`;
                                const convertDate = `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
                                for (item of body.guests) {
                                        await ModelInvite.create({
                                                idAccountClient: item.idAccount,
                                                idAccountInvite: resultOrder.idClient,
                                                idRestaurant: resultOrder.idRestaurant,
                                                receptionTime: body.receptionTime,
                                                idOrder: resultOrder._id,
                                                createDate: Date.now(),
                                        });
                                        const notification = {
                                                idAccount: item.idAccount,
                                                idDetail: restaurant._id,
                                                title: user.name,
                                                content: `đã mời bạn đến tham gia buổi tiệc tại ${restaurant.name} lúc ${convertTime} ngày ${convertDate}!`,
                                                image: user.avatar,
                                                type: 'restaurant',
                                                createDate: Date.now()
                                        };
                                        await ModelNotification.create(notification);
                                }
                                format.message = 'Cập nhật thành công !';
                        } else {
                                format.error = true;
                                format.message = 'Cập nhật thất bại !';
                        }
                }
        } catch (error) {
                format.error = true;
                format.message = 'Cập nhật thất bại ! ' + error.message;
        }
        res.json(format);
});


