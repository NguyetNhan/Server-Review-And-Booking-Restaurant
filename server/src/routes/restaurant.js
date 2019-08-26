const app = module.exports = require('express')();
const Model = require('../models/restaurant');
const lodash = require('lodash');
const multer = require('multer');
const path = require('path');
const io = require('../socket');
const ModelUser = require('../models/user');

const adminNotification = io.of('/adminNotification');
adminNotification.on('connection', function (socket) {
        console.log('test connect server notification: ', socket.id);
        socket.on('disconnect', () => {
                console.log('user disconnect');
        });
});
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
                const results = await Model.find({ status: 'waiting' });
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
                        console.log('total_page: ', total_page);
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
                } else if (data.type === 'coffee') {
                        const countItem = await Model.countDocuments({ type: 'coffee' });
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

                } else if (data.type === 'bar') {
                        const countItem = await Model.countDocuments({ type: 'bar' });
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
                                var image = [];
                                for (let item of req.files) {
                                        image.push(`/uploads/${item.filename}`);
                                }
                                var data = {
                                        name: req.body.name,
                                        idAdmin: req.body.idAdmin,
                                        phone: req.body.phone,
                                        introduce: req.body.introduce,
                                        address: req.body.address,
                                        imageRestaurant: image,
                                        status: 'waiting',
                                        type: req.body.type,
                                };
                                try {
                                        const resultRestaurant = await Model.find({ idAdmin: data.idAdmin });
                                        if (resultRestaurant.length > 0) {
                                                format.error = true;
                                                format.message = 'Mỗi tài khoản chỉ đăng kí được 1 nhà hàng !';
                                                //   format.data = results;
                                                res.json(format);
                                        } else {
                                                var results = await Model.create(data);
                                                format.error = false;
                                                format.message = 'Gửi đăng kí thành công !';
                                                format.data = results;
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
                const result = await Model.deleteOne({ _id: req.params.idRestaurant });
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
