const app = module.exports = require('express')();
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');
const ModelNotification = require('../models/notification');
const ModelReview = require('../models/review');
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
                const results = await ModelRestaurant.find({ status: 'waiting' }).sort({ createDate: -1 });
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

app.get('/place-review-the-best/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        const page = parseInt(req.params.page);
        try {
                const countItem = await ModelRestaurant.countDocuments({ status: 'ok' });
                format.count_item = countItem;
                let total_page = countItem / 10;
                if (countItem === 0) {
                        format.message = 'Không có địa điểm !';
                        format.page = page;
                        format.total_page = total_page;
                        format.data = [];
                } else {
                        if (Number.isInteger(total_page)) {
                                format.total_page = total_page;
                        } else {
                                total_page = parseInt(total_page);
                                format.total_page = total_page + 1;
                        }
                        if (page > format.total_page || page === 0) {
                                format.error = true;
                                format.page = page;
                                format.message = 'Nhập số trang sai !';
                        } else {
                                if (page === 1) {
                                        format.page = page;
                                        const results = await ModelRestaurant.find({ status: 'ok' }).sort({ star: -1 }).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có địa điểm !';
                                                format.data = results;
                                        }
                                } else {
                                        format.page = page;
                                        const results = await ModelRestaurant.find({ status: 'ok' }).sort({ star: -1 }).skip((page - 1) * 10).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có địa điểm !';
                                                format.data = results;
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
app.get('/list-restaurant/type/:type/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        try {
                const data = {
                        type: req.params.type,
                        page: parseInt(req.params.page)
                };
                if (data.type === 'null') {
                        const countItem = await ModelRestaurant.countDocuments();
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
                                        const result = await ModelRestaurant.find({ status: 'ok' }).limit(10);
                                        if (result.length > 0) {
                                                format.message = 'Thành công !';
                                        } else {
                                                format.message = 'Không có nhà hàng !';
                                        }
                                        format.data = result;
                                        res.json(format);
                                } else {
                                        format.page = data.page;
                                        const result = await ModelRestaurant.find({ status: 'ok' }).skip((data.page - 1) * 10).limit(10);
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
                        const countItem = await ModelRestaurant.countDocuments({ type: 'restaurant' });
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
                                                const result = await ModelRestaurant.find({ status: 'ok', type: 'restaurant' }).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có nhà hàng !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        } else {
                                                format.page = data.page;
                                                const result = await ModelRestaurant.find({ status: 'ok', type: 'restaurant' }).skip((data.page - 1) * 10).limit(10);
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
                        const countItem = await ModelRestaurant.countDocuments({ type: 'coffee' });
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
                                                const result = await ModelRestaurant.find({ status: 'ok', type: 'coffee' }).limit(10);
                                                if (result.length > 0) {
                                                        format.message = 'Thành công !';
                                                } else {
                                                        format.message = 'Không có coffee !';
                                                }
                                                format.data = result;
                                                res.json(format);
                                        } else {
                                                format.page = data.page;
                                                const result = await ModelRestaurant.find({ status: 'ok', type: 'coffee' }).skip((data.page - 1) * 10).limit(10);
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
                }
        } catch (error) {
                format.error = true;
                format.message = error.message;
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
                const results = await ModelRestaurant.findById(idRestaurant);
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
                const result = await ModelRestaurant.findOne({ idAdmin: idAdminRestaurant });
                if (result === null) {
                        format.message = 'Tài khoản không có nhà hàng đăng kí';
                        res.json(format);
                } else {
                        format.message = 'ok';
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

                const result = await ModelRestaurant.find(filter);
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
                                        position: {
                                                latitude: req.body.latitude,
                                                longitude: req.body.longitude
                                        },
                                        createDate: Date.now()
                                };
                                try {
                                        const resultRestaurant = await ModelRestaurant.find({ idAdmin: data.idAdmin });
                                        const account = await ModelUser.findById(data.idAdmin);
                                        if (resultRestaurant.length > 0) {
                                                format.error = true;
                                                format.message = 'Mỗi tài khoản chỉ đăng kí được 1 nhà hàng !';
                                                res.json(format);
                                        } else {
                                                const results = await ModelRestaurant.create(data);
                                                format.error = false;
                                                format.message = 'Gửi đăng kí thành công !';
                                                format.data = results;
                                                const accountAdmin = await ModelUser.findOne({ authorities: 'admin' });
                                                await ModelNotification.create({
                                                        idDetail: results._id,
                                                        idAccount: accountAdmin._id,
                                                        title: account.name,
                                                        content: `đã gửi thông tin đăng kí nhà hàng ${(data.name)} cho bạn !`,
                                                        image: image[0],
                                                        type: 'register',
                                                        createDate: Date.now()
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
                                        format.error = true;
                                        format.message = error.message;
                                        res.status(500).json(format);
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
                await ModelRestaurant.updateOne({ _id: req.params.idRestaurant }, { status: 'ok' });
                await ModelUser.updateOne({ _id: req.params.idAdmin }, { authorities: 'admin-restaurant' });
                const restaurant = await ModelRestaurant.findById(req.params.idRestaurant);
                await ModelNotification.create({
                        idDetail: req.params.idRestaurant,
                        idAccount: req.params.idAdmin,
                        title: restaurant.name,
                        content: 'đã được chấp nhận !',
                        image: restaurant.imageRestaurant[0],
                        type: 'register',
                        createDate: Date.now()
                });
                format.message = 'ok';
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.delete('/confirm-restaurant/:idRestaurant', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        try {
                const restaurant = await ModelRestaurant.findById(req.params.idRestaurant);
                const result = await ModelRestaurant.deleteOne({ _id: req.params.idRestaurant });
                await ModelNotification.create({
                        idDetail: req.params.idRestaurant,
                        idAccount: restaurant.idAdmin,
                        title: restaurant.name,
                        content: 'không được chấp nhận !',
                        image: restaurant.imageRestaurant[0],
                        type: 'register',
                        createDate: Date.now()
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
