const app = module.exports = require('express')();
const ModelOrder = require('../models/order');
const ModelNotification = require('../models/notification');
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');
const ModelReview = require('../models/review');
const ModelMenu = require('../models/menu_restaurant');
const lodash = require('lodash/array');
const multer = require('multer');
const path = require('path');

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
}).array('reviews');

app.get('/idReviewReceiver/:idReviewReceiver/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: null
        };
        const idReviewReceiver = req.params.idReviewReceiver;
        const page = parseInt(req.params.page);
        try {
                if (idReviewReceiver === null) {
                        format.error = true;
                        format.message = 'Thiếu Id nhà hàng !';
                } else if (page === null) {
                        format.error = true;
                        format.message = 'Trang không được bỏ trống !';
                }
                else {
                        const countItem = await ModelReview.countDocuments({ idReviewReceiver: idReviewReceiver });
                        format.count_item = countItem;
                        let total_page = countItem / 10;
                        if (countItem === 0) {
                                format.message = 'Không có đánh giá !';
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
                                                const results = await ModelReview.find({ idReviewReceiver: idReviewReceiver }).sort({ date: -1 }).limit(10);
                                                if (results.length > 0) {
                                                        format.message = 'ok';
                                                        format.data = results;
                                                } else {
                                                        format.error = false;
                                                        format.message = 'Không có đánh giá !';
                                                        format.data = [];
                                                }
                                        } else {
                                                format.page = page;
                                                const results = await ModelReview.find({ idReviewReceiver: idReviewReceiver }).sort({ date: -1 }).skip((page - 1) * 10).limit(10);
                                                if (results.length > 0) {
                                                        format.message = 'ok';
                                                        format.data = results;
                                                } else {
                                                        format.error = false;
                                                        format.message = 'Không có đánh giá !';
                                                        format.data = [];
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
app.get('/check-client-has-orders/idReviewReceiver/:idReviewReceiver/idReviewAccount/:idReviewAccount', async (req, res) => {
        var format = {
                error: false,
                messages: '',
                review: false,
                data: null
        };
        const idReviewAccount = req.params.idReviewAccount;
        const idReviewReceiver = req.params.idReviewReceiver;
        try {
                const review = await ModelReview.findOne({ idReviewReceiver: idReviewReceiver, idReviewAccount: idReviewAccount });
                if (review === null) {
                        format.review = false;
                        format.messages = 'Chưa được đánh giá !';
                } else {
                        format.review = true;
                        format.messages = 'Đã đánh giá !';
                        format.data = review;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.messages = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.get('/sum-score-review/idReviewReceiver/:idReviewReceiver', async (req, res) => {
        var format = {
                error: false,
                message: '',
                mediumScore: 0,
                data: null
        };
        const idReviewReceiver = req.params.idReviewReceiver;
        try {
                const listReview = await ModelReview.find({ idReviewReceiver: idReviewReceiver });
                if (listReview.length === 0) {
                        format.message = 'Cửa hàng chưa có đánh giá nào để có điểm !';
                } else {
                        var sumScore = 0;
                        for (item of listReview) {
                                sumScore = sumScore + item.score;
                        }
                        format.message = 'ok';
                        format.mediumScore = sumScore / listReview.length;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});


app.put('/update-review/idReview/:idReview/idReviewReceiver/:idReviewReceiver/idReviewAccount/:idReviewAccount', async (req, res) => {
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
                        const idReview = req.params.idReview;
                        const idReviewAccount = req.params.idReviewAccount;
                        const idReviewReceiver = req.params.idReviewReceiver;
                        var image = [];
                        var data = {};
                        if (req.files === undefined) {
                                image = null;
                                data = {
                                        content: req.body.content,
                                        score: Number.parseInt(req.body.score),
                                        date: Date.now(),
                                };
                        } else {
                                for (let item of req.files) {
                                        image.push(`/uploads/${item.filename}`);
                                }
                                data = {
                                        imageReview: image,
                                        content: req.body.content,
                                        score: Number.parseInt(req.body.score),
                                        date: Date.now(),
                                };
                        }

                        try {
                                const results = await ModelReview.findByIdAndUpdate(idReview, { $set: data }, { useFindAndModify: false });
                                if (results === null) {
                                        format.error = true;
                                        format.message = 'Mã Id sai hoặc review chưa tồn tại !';
                                } else {
                                        format.message = 'ok';
                                        format.data = results;
                                        const restaurant = await ModelRestaurant.findById(idReviewReceiver);
                                        const client = await ModelUser.findById(idReviewAccount);
                                        if (restaurant !== null) {
                                                if (restaurant.type === 'restaurant') {
                                                        await ModelNotification.create({
                                                                idAccount: restaurant.idAdmin,
                                                                idRestaurant: restaurant._id,
                                                                idReview: results._id,
                                                                title: client.name,
                                                                content: `đã cập nhật lại nhận xét cho nhà hàng ${restaurant.name} của bạn !`,
                                                                image: client.avatar,
                                                                type: 'review',
                                                                time: Date.now()
                                                        });
                                                } else if (restaurant.type === 'coffee') {
                                                        await ModelNotification.create({
                                                                idAccount: restaurant.idAdmin,
                                                                idRestaurant: restaurant._id,
                                                                idReview: results._id,
                                                                title: client.name,
                                                                content: `đã cập nhật lại nhận xét cho quán coffee ${restaurant.name} của bạn !`,
                                                                image: client.avatar,
                                                                type: 'review',
                                                                time: Date.now()
                                                        });
                                                }
                                        } else {
                                                const food = await ModelMenu.findById(idReviewReceiver);
                                                if (food !== null) {
                                                        const restaurant = await ModelRestaurant.findById(food.idRestaurant);
                                                        if (restaurant.type === 'restaurant') {
                                                                await ModelNotification.create({
                                                                        idAccount: restaurant.idAdmin,
                                                                        idRestaurant: restaurant._id,
                                                                        idReview: results._id,
                                                                        title: client.name,
                                                                        content: `đã cập nhật lại nhận xét cho món ${food.name} trong thực đơn nhà hàng ${restaurant.name} của bạn !`,
                                                                        image: client.avatar,
                                                                        type: 'review',
                                                                        time: Date.now()
                                                                });
                                                        } else if (restaurant.type === 'coffee') {
                                                                await ModelNotification.create({
                                                                        idAccount: restaurant.idAdmin,
                                                                        idReview: results._id,
                                                                        idRestaurant: restaurant._id,
                                                                        title: client.name,
                                                                        content: `đã cập nhật lại nhận xét cho món ${food.name} trong thực đơn quán coffee ${restaurant.name} của bạn !`,
                                                                        image: client.avatar,
                                                                        type: 'review',
                                                                        time: Date.now()
                                                                });
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
                }
        });
});
app.post('/add-review', async (req, res) => {
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
                        var image = [];
                        if (req.files === undefined) {
                                image = null;
                        } else {
                                for (let item of req.files) {
                                        image.push(`/uploads/${item.filename}`);
                                }
                        }
                        const data = {
                                type: req.body.type,
                                idReviewAccount: req.body.idReviewAccount,
                                idReviewReceiver: req.body.idReviewReceiver,
                                imageReview: image,
                                content: req.body.content,
                                score: Number.parseInt(req.body.score),
                                date: Date.now(),
                        };
                        try {
                                const review = await ModelReview.create(data);
                                if (review !== null) {
                                        format.message = 'Đánh giá thành công !';
                                        format.data = review;
                                        const restaurant = await ModelRestaurant.findById(data.idReviewReceiver);
                                        const client = await ModelUser.findById(data.idReviewAccount);
                                        if (restaurant !== null) {
                                                if (restaurant.type === 'restaurant') {
                                                        await ModelNotification.create({
                                                                idAccount: restaurant.idAdmin,
                                                                idReview: review._id,
                                                                idRestaurant: restaurant._id,
                                                                title: client.name,
                                                                content: `đã đánh giá ${data.score} sao cho nhà hàng ${restaurant.name} của bạn !`,
                                                                image: client.avatar,
                                                                type: 'review',
                                                                time: Date.now()
                                                        });
                                                } else if (restaurant.type === 'coffee') {
                                                        await ModelNotification.create({
                                                                idAccount: restaurant.idAdmin,
                                                                idRestaurant: restaurant._id,
                                                                idReview: review._id,
                                                                title: client.name,
                                                                content: `đã đánh giá ${data.score} sao cho quán coffee ${restaurant.name} của bạn !`,
                                                                image: client.avatar,
                                                                type: 'review',
                                                                time: Date.now()
                                                        });
                                                }
                                        } else {
                                                const food = await ModelMenu.findById(data.idReviewReceiver);
                                                if (food !== null) {
                                                        const restaurant = await ModelRestaurant.findById(food.idRestaurant);
                                                        if (restaurant.type === 'restaurant') {
                                                                await ModelNotification.create({
                                                                        idAccount: restaurant.idAdmin,
                                                                        idRestaurant: restaurant._id,
                                                                        idReview: review._id,
                                                                        title: client.name,
                                                                        content: `đã đánh giá ${data.score} sao cho món ${food.name} trong thực đơn nhà hàng ${restaurant.name} của bạn !`,
                                                                        image: client.avatar,
                                                                        type: 'review',
                                                                        time: Date.now()
                                                                });
                                                        } else if (restaurant.type === 'coffee') {
                                                                await ModelNotification.create({
                                                                        idAccount: restaurant.idAdmin,
                                                                        idRestaurant: restaurant._id,
                                                                        idReview: review._id,
                                                                        title: client.name,
                                                                        content: `đã đánh giá ${data.score} sao cho món ${food.name} trong thực đơn quán coffee ${restaurant.name} của bạn !`,
                                                                        image: client.avatar,
                                                                        type: 'review',
                                                                        time: Date.now()
                                                                });
                                                        }
                                                }
                                        }
                                        res.json(format);
                                }
                        } catch (error) {
                                format.error = true;
                                format.message = error.message;
                                res.status(500).json(format);
                        }
                }
        });

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