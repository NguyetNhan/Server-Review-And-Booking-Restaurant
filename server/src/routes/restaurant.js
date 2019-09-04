const app = module.exports = require('express')();
const Model = require('../models/restaurant');
const ModelUser = require('../models/user');
const ModalNotification = require('../models/notification');
const lodash = require('lodash/array');
const multer = require('multer');
const path = require('path');

const { idClientConnect, io } = require('../socket');

const storage = multer.diskStorage({
        destination: function (req, file, callback) {
                callback(null, './public/uploads');
        },
        filename: function (req, file, callback) {
                callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
        }
});

const upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
                checkFileType(file, cb);
        }
}).array('restaurant');


app.get('/confirm-restaurant', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        try {
                const results = await Model.find({ status: 'waiting' }).sort({ date_register: -1 });
                if (results.length > 0) {
                        format.message = 'Thành công !';
                        format.data = results;
                } else {
                        format.message = 'Không có nhà hàng đăng kí mới !';
                }
                res.json(format);
        } catch (error) {
                res.status(500).json(error);
        }
});

app.get('/list-restaurant/type/:type/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: null
        };
        try {
                const data = {
                        type: req.params.type,
                        page: parseInt(req.params.page)
                };
                if (data.type === 'null') {
                        const countItem = await Model.countDocuments();
                        format.count_item = countItem;
                        let total_page = countItem / 10;
                        if (Number.isInteger(total_page)) {
                                format.total_page = total_page;
                        } else {
                                total_page = parseInt(total_page);
                                format.total_page = total_page + 1;
                        }
                        if (data.page > format.total_page || data.page === 0) {
                                format.error = true;
                                format.page = data.page;
                                format.message = 'Nhập số trang sai !';
                                res.json(format);
                        } else {
                                if (data.page === 1) {
                                        const result = await Model.find({ status: 'ok' }).limit(10);
                                        if (result.length > 0) {
                                                format.message = 'Thành công !';
                                        } else {
                                                format.message = 'Không có nhà hàng !';
                                        }
                                        format.data = result;
                                        res.json(format);
                                } else {
                                        format.page = data.page;
                                        const result = await Model.find({ status: 'ok' }).skip((data.page - 1) * 10).limit(10);
                                        if (result.length > 0) {
                                                format.message = 'Thành công !';
                                        } else {
                                                format.message = 'Không có nhà hàng !';
                                        }
                                        format.data = result;
                                        res.json(format);
                                }
                        }
                } else if (data.type === 'restaurant') {
                        const countItem = await Model.countDocuments({ type: 'restaurant' });
                        format.count_item = countItem;
                        let total_page = countItem / 10;
                        if (countItem === 0) {
                                format.message = 'Không có nhà hàng !';
                                format.page = data.page;
                                format.total_page = total_page;
                                format.data = [];
                                res.json(format);
                        } else {
                                if (Number.isInteger(total_page)) {
                                        format.total_page = total_page;
                                } else {
                                        total_page = parseInt(total_page);
                                        format.total_page = total_page + 1;
                                }
                                if (data.page > format.total_page || data.page === 0) {
                                        format.error = true;
                                        format.page = data.page;
                                        format.message = 'Nhập số trang sai !';
                                        res.json(format);
                                } else {
                                        if (data.page === 1) {
                                                const result = await Model.find({ status: 'ok', type: 'restaurant' }).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có nhà hàng !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        } else {
                                                format.page = data.page;
                                                const result = await Model.find({ status: 'ok', type: 'restaurant' }).skip((data.page - 1) * 10).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có nhà hàng !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        }
                                }
                        }

                } else if (data.type === 'coffee') {
                        const countItem = await Model.countDocuments({ type: 'coffee' });
                        format.count_item = countItem;
                        var total_page = countItem / 10;
                        if (countItem === 0) {
                                format.message = 'Không có cửa hàng Coffee !';
                                format.page = data.page;
                                format.total_page = total_page;
                                format.data = [];
                                res.json(format);
                        } else {
                                if (Number.isInteger(total_page)) {
                                        format.total_page = total_page;
                                } else {
                                        total_page = parseInt(total_page);
                                        format.total_page = total_page + 1;
                                }
                                if (data.page > format.total_page || data.page === 0) {
                                        format.error = true;
                                        format.page = data.page;
                                        format.message = 'Nhập số trang sai !';
                                        res.json(format);
                                } else {
                                        if (data.page === 1) {
                                                const result = await Model.find({ status: 'ok', type: 'coffee' }).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có coffee !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        } else {
                                                format.page = data.page;
                                                const result = await Model.find({ status: 'ok', type: 'coffee' }).skip((data.page - 1) * 10).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có coffee !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        }
                                }
                        }


                } else if (data.type === 'bar') {
                        const countItem = await Model.countDocuments({ type: 'bar' });
                        format.count_item = countItem;
                        let total_page = countItem / 10;
                        if (countItem === 0) {
                                format.message = 'Không có nhà hàng !';
                                format.page = data.page;
                                format.total_page = total_page;
                                format.data = [];
                                res.json(format);
                        } else {
                                if (Number.isInteger(total_page)) {
                                        format.total_page = total_page;
                                } else {
                                        total_page = parseInt(total_page);
                                        format.total_page = total_page + 1;
                                }
                                if (data.page > format.total_page || data.page === 0) {
                                        format.error = true;
                                        format.page = data.page;
                                        format.message = 'Nhập số trang sai !';
                                        res.json(format);
                                } else {
                                        if (data.page === 1) {
                                                const result = await Model.find({ status: 'ok', type: 'bar' }).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có bar !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        } else {
                                                format.page = data.page;
                                                const result = await Model.find({ status: 'ok', type: 'bar' }).skip((data.page - 1) * 10).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có bar !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        }
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

app.get('/id/:id', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idRestaurant = req.params.id;
        try {
                const results = await Model.findById(idRestaurant);
                format.message = 'Ok';
                format.data = results;
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.get('/idAdminRestaurant/:id', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idAdminRestaurant = req.params.id;
        try {
                const result = await Model.find({ idAdmin: idAdminRestaurant });
                if (result.length === 1) {
                        format.message = 'ok';
                        format.data = result[0];
                        res.json(format);
                } else {
                        format.error = true;
                        format.message = 'Tài khoản chưa đăng kí nhà hàng !';
                        format.data = result;
                        res.json(format);
                }
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }

});

app.post('/search', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const content = req.body.content.trim();
        const type = req.body.type.trim();
        const address = req.body.address.trim();
        try {
                //  const userRegex = new RegExp(content, 'i');
                const filter = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: content, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        address: { $regex: content, $options: 'i' }
                                                }
                                        ]
                                },
                                {
                                        type: type
                                },
                                {
                                        address: { $regex: address, $options: 'i' }
                                },
                        ]
                };

                const result = await Model.find(filter);
                if (result.length === 0) {
                        format.message = 'Không có kết quả !';
                        format.data = result;
                        res.json(format);
                } else {
                        format.message = 'ok';
                        format.data = result;
                        res.json(format);
                }
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.post('/register-restaurant', async (req, res) => {
        await upload(req, res, async (err) => {
                var format = {
                        error: false,
                        message: '',
                        data: null
                };
                if (err) {
                        format.error = true;
                        format.message = err.message;
                        res.json(format);
                } else {
                        if (req.files === undefined) {
                                format.error = true;
                                format.message = 'Không có hình được chọn !';
                                res.json(format);
                        } else {
                                const image = [];
                                for (let item of req.files) {
                                        image.push(`/uploads/${item.filename}`);
                                }
                                const data = {
                                        name: req.body.name,
                                        idAdmin: req.body.idAdmin,
                                        phone: req.body.phone,
                                        introduce: req.body.introduce,
                                        address: req.body.address,
                                        imageRestaurant: image,
                                        status: 'waiting',
                                        type: req.body.type,
                                        time_activity: req.body.time_activity,
                                        follow: 0,
                                        date_register: Date.now()
                                };
                                try {
                                        const resultRestaurant = await Model.find({ idAdmin: data.idAdmin });
                                        const account = await ModelUser.findById(data.idAdmin);
                                        if (resultRestaurant.length > 0) {
                                                format.error = true;
                                                format.message = 'Mỗi tài khoản chỉ đăng kí được 1 nhà hàng !';
                                                //   format.data = results;
                                                res.json(format);
                                        } else {
                                                const results = await Model.create(data);
                                                format.error = false;
                                                format.message = 'Gửi đăng kí thành công !';
                                                format.data = results;
                                                const accountAdmin = await ModelUser.findOne({ authorities: 'admin' });
                                                await ModalNotification.create({
                                                        idRestaurant: results._id,
                                                        idAccount: accountAdmin._id,
                                                        title: account.name,
                                                        content: `đã gửi thông tin đăng kí nhà hàng ${(data.name).toLowerCase()} cho bạn !`,
                                                        image: image[0],
                                                        type: 'register_restaurant',
                                                        time: Date.now()
                                                });
                                                const indexId = lodash.findIndex(idClientConnect, (item) => {
                                                        return item.idAccount == accountAdmin._id;
                                                });
                                                if (indexId >= 0) {
                                                        const idSocketAdmin = idClientConnect[indexId].idSocket;
                                                        io.to(`${idSocketAdmin}`).emit('notification', ' đã gửi đăng kí thông tin nhà hàng !');
                                                }
                                                res.json(format);
                                        }
                                } catch (error) {
                                        console.log('error: ', error);
                                }
                        }
                }
        });
});


app.put('/confirm-restaurant/:idRestaurant/:idAdmin', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        try {
                await Model.updateOne({ _id: req.params.idRestaurant }, { status: 'ok' });
                await ModelUser.updateOne({ _id: req.params.idAdmin }, { authorities: 'admin-restaurant' });
                const restaurant = await Model.findById(req.params.idRestaurant);
                await ModalNotification.create({
                        idRestaurant: req.params.idRestaurant,
                        idAccount: req.params.idAdmin,
                        title: restaurant.name,
                        content: 'đã được chấp nhận !',
                        image: restaurant.imageRestaurant[0],
                        type: 'register_restaurant_succeeded',
                        time: Date.now()
                });
                format.message = 'ok';
                res.json(format);
        } catch (error) {
                res.status(500).json(error);
        }
});

app.delete('/confirm-restaurant/:idRestaurant', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        try {
                const restaurant = await Model.findById(req.params.idRestaurant);
                const result = await Model.deleteOne({ _id: req.params.idRestaurant });
                await ModalNotification.create({
                        idRestaurant: req.params.idRestaurant,
                        idAccount: restaurant.idAdmin,
                        title: restaurant.name,
                        content: 'không được chấp nhận !',
                        image: restaurant.imageRestaurant[0],
                        type: 'register_restaurant_failed',
                        time: Date.now()
                });
                format.message = 'ok';
                format.data = result;
                res.json(format);
        } catch (error) {
                res.status(500).json(error);
        }
});


function checkFileType (file, callback) {
        // Allowed ext
        const filetypes = /jpeg|jpg|png/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
                return callback(null, true);
        } else {
                callback('Error: Images Only!');
        }
}