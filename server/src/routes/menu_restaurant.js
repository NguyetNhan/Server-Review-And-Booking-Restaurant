const app = module.exports = require('express')();
const Model = require('../models/menu_restaurant');
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


app.get('/idRestaurant/:id', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idRestaurant = req.params.id;
        try {
                const results = await Model.find({ idRestaurant: idRestaurant }).sort({ date_add: -1 });
                format.message = 'ok';
                format.data = results;
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }
})
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
                                        date_add: Date.now()
                                };
                                try {
                                        const results = await Model.create(data);
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
