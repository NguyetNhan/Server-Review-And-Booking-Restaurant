var app = module.exports = require('express')();
var Model = require('../models/restaurant');
var lodash = require('lodash');
var multer = require('multer');
const path = require('path');
var io = require('../socket');
var ModelUser = require('../models/user');



const adminNotification = io.of('/adminNotification');
adminNotification.on('connection', function (socket) {
        console.log('test connect server notification: ', socket.id);
        socket.on('disconnect', () => {
                console.log('user disconnect');
        });
});


var storage = multer.diskStorage({
        destination: function (req, file, callback) {
                callback(null, './public/uploads');
        },
        filename: function (req, file, callback) {
                callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
        }
});

var upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
                checkFileType(file, cb);
        }
}).array('restaurant');
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
                                        status: 'waiting'
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
