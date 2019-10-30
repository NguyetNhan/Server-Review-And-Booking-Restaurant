const app = module.exports = require('express')();
const lodash = require('lodash/array');
const ModelPost = require('../models/post');
const ModelOrder = require('../models/order');
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');
const ModelNotification = require('../models/notification');
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
}).array('post');


app.get('/place-list-has-arrived/idAccount/:idAccount', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
        };
        const idAccount = req.params.idAccount;
        try {
                const resultOrderList = await ModelOrder.find({ idClient: idAccount }).sort({ createDate: -1 });
                if (resultOrderList.length === 0) {
                        format.message = 'Bạn chưa đến địa điểm nào !';
                } else {
                        let list = [];
                        let idCheck = 'id';
                        for (item of resultOrderList) {
                                if (item.idRestaurant !== idCheck) {
                                        list.push(item);
                                        idCheck = item.idRestaurant;
                                }
                        }
                        let restaurantList = [];
                        for (item of list) {
                                const resultRestaurant = await ModelRestaurant.findById(item.idRestaurant);
                                if (resultRestaurant !== null)
                                        restaurantList.push(resultRestaurant);
                        }
                        format.message = 'ok';
                        format.data = restaurantList;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});
app.get('/post-list/idAccount/:idAccount/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        const idAccount = req.params.idAccount;
        const page = parseInt(req.params.page);
        try {
                const countItem = await ModelPost.countDocuments({ idAccount: idAccount });
                format.count_item = countItem;
                let total_page = countItem / 10;
                if (countItem === 0) {
                        format.message = 'Chưa có bài biết nào !';
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
                                        const results = await ModelPost.find({ idAccount: idAccount }).sort({ createDate: -1 }).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Chưa có bài biết nào !';
                                                format.data = results;
                                        }
                                } else {
                                        format.page = page;
                                        const results = await ModelPost.find({ idAccount: idAccount }).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Chưa có bài biết nào !';
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

app.get('/check-has-liked/idPost/:idPost/idAccount/:idAccount', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idPost = req.params.idPost;
        const idAccount = req.params.idAccount;
        try {
                const resultPost = await ModelPost.findById(idPost);
                if (resultPost === null) {
                        format.error = true;
                        format.message = 'Bài viết không tồn tại !';

                } else {
                        let checkExist = false;
                        for (item of resultPost.like) {
                                if (idAccount === item.idAccount) {
                                        checkExist = true;
                                        break;
                                }
                        }
                        if (checkExist) {
                                format.data = {
                                        isLiked: true
                                };
                        } else {
                                format.data = {
                                        isLiked: false
                                };
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.post('/create-post', async (req, res) => {
        await upload(req, res, async (err) => {
                var format = {
                        error: false,
                        message: '',
                        data: null
                };
                if (err) {
                        format.error = true;
                        format.message = err.message;
                } else {
                        if (req.files === undefined) {
                                const body = {
                                        idAccount: req.body.idAccount,
                                        idRestaurant: req.body.idRestaurant,
                                        content: req.body.content,
                                        image: null,
                                        createDate: Date.now(),
                                };
                                try {
                                        const result = await ModelPost.create(body);
                                        if (result === null) {
                                                format.error = true;
                                                format.message = 'Không thể thêm bài viết !';
                                        } else {
                                                format.message = 'Tạo bài viết thành công !';
                                                format.data = result;
                                        }
                                } catch (error) {
                                        format.error = true;
                                        format.message = error.message;
                                }
                        } else {
                                const image = [];
                                for (let item of req.files) {
                                        image.push(`/uploads/${item.filename}`);
                                }
                                const body = {
                                        idAccount: req.body.idAccount,
                                        idRestaurant: req.body.idRestaurant,
                                        content: req.body.content,
                                        image: image,
                                        createDate: Date.now(),
                                };
                                try {
                                        const result = await ModelPost.create(body);
                                        if (result === null) {
                                                format.error = true;
                                                format.message = 'Không thể thêm bài viết !';
                                        } else {
                                                format.message = 'Tạo bài viết thành công !';
                                                format.data = result;
                                        }
                                } catch (error) {
                                        format.error = true;
                                        format.message = error.message;
                                }
                        }
                }
                res.json(format);
        });
});

app.put('/like-post/idPost/:idPost/idAccount/:idAccount', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idPost = req.params.idPost;
        const idAccount = req.params.idAccount;
        try {
                const resultPost = await ModelPost.findById(idPost);
                if (resultPost === null) {
                        format.error = true;
                        format.message = 'Bài viết này không tồn tại !';
                } else {
                        let likeList = resultPost.like;
                        let checkExist = false;
                        let position = null;
                        for (let i = 0; i < likeList.length; i++) {
                                if (idAccount === likeList[i].idAccount) {
                                        checkExist = true;
                                        position = i;
                                        break;
                                }
                        }
                        if (checkExist) {
                                likeList.splice(position, 1);
                        } else {
                                likeList.push({
                                        idAccount: idAccount,
                                        createDate: Date.now
                                });
                                if (idAccount !== resultPost.idAccount) {
                                        const resultUser = await ModelUser.findById(idAccount);
                                        if (resultUser !== null) {
                                                const notification = {
                                                        idAccount: resultPost.idAccount,
                                                        idDetail: resultPost._id,
                                                        title: resultUser.name,
                                                        content: `đã thích bài viết của bạn "${resultPost.content}"`,
                                                        image: resultUser.avatar,
                                                        type: 'post',
                                                        createDate: Date.now()
                                                };
                                                await ModelNotification.create(notification);
                                        }
                                }
                        }
                        const updatePost = await ModelPost.updateOne({ _id: idPost }, { like: likeList });
                        if (updatePost.ok === 1)
                                format.message = 'ok';
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.put('/update-view-restaurant/idPost/:idPost/idAccountView/:idAccountView', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const idPost = req.params.idPost;
        const idAccountView = req.params.idAccountView;
        try {
                const resultPost = await ModelPost.findById(idPost);
                if (resultPost === null) {
                        format.error = true;
                        format.message = 'Bài viết không tồn tại !';
                } else {
                        if (idAccountView !== resultPost.idAccount) {
                                const accountAdminPost = await ModelUser.findById(resultPost.idAccount);
                                if (accountAdminPost === null) {
                                        format.error = true;
                                        format.message = 'Tài khoản quản lí bài viết không tồn tại !';
                                } else {
                                        let scoreAccount = accountAdminPost.score;
                                        await ModelUser.updateOne({ _id: resultPost.idAccount }, { score: scoreAccount + 20 });
                                        await ModelPost.updateOne({ _id: idPost }, { viewRestaurant: resultPost.viewRestaurant + 1 });
                                        format.message = 'ok';
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