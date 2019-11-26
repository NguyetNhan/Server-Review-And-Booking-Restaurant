var app = module.exports = require('express')();
var Model = require('../models/user');
var lodash = require('lodash');
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
}).single('avatar');
app.get('/id/:id', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const id = req.params.id;
        try {
                const result = await Model.findById(id);
                if (result !== null) {
                        format.message = 'ok';
                        format.data = result;
                } else {
                        format.error = true;
                        format.message = 'ID tài khoản không chính xác';
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.post('/signup', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        try {
                if (lodash.isEmpty(req.body.name)) {
                        format.error = true;
                        format.message = 'Tên không được để trống !';
                } else if (lodash.isEmpty(req.body.email)) {
                        format.error = true;
                        format.message = 'Email không được để trống !';
                } else if (lodash.isEmpty(req.body.password)) {
                        format.error = true;
                        format.message = 'Mật khẩu không được để trống !';
                } else if (lodash.isEmpty(req.body.phone)) {
                        format.error = true;
                        format.message = 'Số điện thoại không được để trống !';
                } else {
                        var user = {
                                name: req.body.name,
                                email: req.body.email,
                                password: req.body.password,
                                avatar: null,
                                score: 0,
                                phone: req.body.phone,
                                authorities: 'client',
                                conversation: [],
                                createDate: Date.now()
                        };
                        var options = {
                                email: req.body.email
                        };
                        const result = await Model.findOne(options);
                        if (result !== null) {
                                format.error = true;
                                format.message = 'Tài khoản đã tồn tại !';
                        } else {
                                var results = await Model.create(user);
                                results.password = null;
                                format.error = false;
                                format.message = 'Tạo tài khoản thành công !';
                                format.data = results;
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.post('/login', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        try {
                if (lodash.isEmpty(req.body.email)) {
                        format.error = true;
                        format.message = 'Email không được để trống !';
                } else if (lodash.isEmpty(req.body.password)) {
                        format.error = true;
                        format.message = 'Mật khẩu không được để trống !';
                } else {
                        const options = {
                                email: req.body.email
                        };
                        let result = await Model.findOne(options);
                        if (result === null) {
                                format.error = true;
                                format.message = 'Tài khoản không tồn tại !';
                                format.data = null;
                        } else {
                                if (req.body.password === result.password) {
                                        format.error = false;
                                        format.message = 'Đăng nhập thành công !';
                                        format.data = result;
                                } else {
                                        format.error = true;
                                        format.message = 'Sai mật khẩu !';
                                }
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                format.data = error;
                res.status(500).json(format);
        }

});

app.put('/update-account/idAccount/:idAccount', async (req, res) => {
        const idAccount = req.params.idAccount;
        await upload(req, res, async (err) => {
                let format = {
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
                        let body = {};
                        if (req.file === undefined) {
                                body = {
                                        name: req.body.name,
                                        phone: req.body.phone,
                                        password: req.body.password
                                };
                        } else {
                                let image = `/uploads/${req.file.filename}`;
                                body = {
                                        name: req.body.name,
                                        phone: req.body.phone,
                                        password: req.body.password,
                                        avatar: image
                                };
                        }
                        try {
                                const resultUpdate = await Model.updateOne({ _id: idAccount }, body);
                                if (resultUpdate.ok === 1) {
                                        const acc = await Model.findById(idAccount);
                                        if (acc !== null) {
                                                format.data = acc;
                                        }
                                        format.message = 'Cập nhật thành công !';
                                } else {
                                        format.error = true;
                                        format.message = 'Cập nhật thất bại !';
                                }
                        } catch (error) {
                                format.error = true;
                                format.message = 'Cập nhật thất bại ! ' + error.message;
                        }
                }
                res.json(format);
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