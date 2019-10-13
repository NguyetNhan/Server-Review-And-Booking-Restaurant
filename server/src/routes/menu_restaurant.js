const app = module.exports = require('express')();
const ModelMenu = require('../models/menu_restaurant');
const ModelReview = require('../models/review');
const lodash = require('lodash');
const multer = require('multer');
const path = require('path');
const { io } = require('../socket');


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
}).single('menu');

app.get('/id/:id', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const id = req.params.id;
        try {
                const results = await ModelMenu.findById(id);
                if (results === null) {
                        format.error = true;
                        format.message = 'Mã ID không chính xác !';
                } else {
                        format.message = 'ok';
                        format.data = results;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }
});

app.get('/list-food-the-best/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: null
        };
        const page = parseInt(req.params.page);
        try {
                const countItem = await ModelMenu.countDocuments();
                format.count_item = countItem;
                let total_page = countItem / 10;
                if (countItem === 0) {
                        format.message = 'Không có món ăn !';
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
                                        const results = await ModelMenu.find().sort({ star: -1 }).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có món ăn !';
                                                format.data = results;
                                        }
                                } else {
                                        format.page = page;
                                        const results = await ModelMenu.find().sort({ star: -1 }).skip((page - 1) * 10).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có món ăn !';
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
})

app.get('/idRestaurant/:id/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: null
        };
        const idRestaurant = req.params.id;
        const page = parseInt(req.params.page);
        const countItem = await ModelMenu.countDocuments({ idRestaurant: idRestaurant });
        format.count_item = countItem;
        let total_page = countItem / 10;
        if (countItem === 0) {
                format.message = 'Không có món ăn !';
                format.page = page;
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
                if (page > format.total_page || page === 0) {
                        format.error = true;
                        format.page = page;
                        format.message = 'Nhập số trang sai !';
                        res.json(format);
                } else {
                        if (page === 1) {
                                const results = await ModelMenu.find({ idRestaurant: idRestaurant }).sort({ date_add: -1 }).limit(10);
                                if (results.length > 0) {
                                        format.message = 'ok';
                                        format.data = results;
                                        res.json(format);
                                } else {
                                        format.error = false;
                                        format.message = 'Không có món ăn !';
                                        format.data = results;
                                        res.json(format);
                                }
                        } else {
                                format.page = page;
                                const results = await ModelMenu.find({ idRestaurant: idRestaurant }).sort({ date_add: -1 }).skip((page - 1) * 10).limit(10);
                                if (results.length > 0) {
                                        format.message = 'ok';
                                        format.data = results;
                                        res.json(format);
                                } else {
                                        format.error = false;
                                        format.message = 'Không có món ăn !';
                                        format.data = results;
                                        res.json(format);
                                }
                        }
                }
        }
});
app.post('/add-menu', async (req, res) => {
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
                        // upload image bằng array thì dùng files 
                        // nếu single thì dùng file
                        if (req.file === undefined) {
                                format.error = true;
                                format.message = 'Không có hình được chọn !';
                                res.json(format);
                        } else {
                                var image = `/uploads/${req.file.filename}`;
                                var data = {
                                        name: req.body.name,
                                        idRestaurant: req.body.idRestaurant,
                                        introduce: req.body.introduce,
                                        image: image,
                                        price: req.body.price,
                                        createDate: Date.now()
                                };
                                try {
                                        const results = await ModelMenu.create(data);
                                        format.error = false;
                                        format.message = 'Thêm thành công !';
                                        format.data = results;
                                        res.json(format);
                                } catch (error) {
                                        format.error = true;
                                        format.message = 'Thêm thất bại !';
                                        format.data = error;
                                        res.status(500).json(format);
                                }
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
