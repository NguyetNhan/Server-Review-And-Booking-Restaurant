const app = module.exports = require('express')();
const lodash = require('lodash/array');
const ModelPost = require('../models/post');
const ModelOrder = require('../models/order');
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');
const ModelNotification = require('../models/notification');
const ModelFriend = require('../models/friend');
const ModelFollow = require('../models/follow');
const ModelDiscount = require('../models/discount');
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

app.get('/get-post/idPost/:idPost', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const idPost = req.params.idPost;
        try {
                const post = await ModelPost.findById(idPost);
                if (post === null) {
                        format.error = true;
                        format.message = 'Bài viết không tồn tại !';
                } else {
                        format.data = post;
                        format.message = 'ok';
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.get('/home/post-list/page/:page', async (req, res) => {
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
                const countItem = await ModelPost.countDocuments();
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
                                        const results = await ModelPost.find().sort({ createDate: -1 }).limit(10);
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
                                        const results = await ModelPost.find().sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
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

app.get('/restaurant/post-list/idAccountRestaurant/:idAccountRestaurant/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        const page = parseInt(req.params.page);
        const idAccountRestaurant = req.params.idAccountRestaurant;
        try {
                const countItem = await ModelPost.countDocuments({ idAccount: idAccountRestaurant, typePost: 'restaurant' });
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
                                        const results = await ModelPost.find({ idAccount: idAccountRestaurant, typePost: 'restaurant' }).sort({ createDate: -1 }).limit(10);
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
                                        const results = await ModelPost.find({ idAccount: idAccountRestaurant, typePost: 'restaurant' }).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
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
                        let body = null;
                        let discount = null;
                        if (req.body.percentDiscount !== undefined) {
                                discount = {
                                        name: req.body.nameDiscount,
                                        createDate: Date.now(),
                                        endDate: req.body.endDateDiscount,
                                        amount: req.body.amountDiscount,
                                        idRestaurant: req.body.idRestaurant,
                                        percent: req.body.percentDiscount,
                                };
                        }
                        const typePost = req.body.typePost;
                        if (typePost === 'restaurant') {
                                if (discount === null) {
                                        if (req.files === undefined) {
                                                body = {
                                                        idAccount: req.body.idAccount,
                                                        idRestaurant: req.body.idRestaurant,
                                                        content: req.body.content,
                                                        typePost: req.body.typePost,
                                                        image: null,
                                                        createDate: Date.now(),
                                                };
                                        } else {
                                                const image = [];
                                                for (let item of req.files) {
                                                        image.push(`/uploads/${item.filename}`);
                                                }
                                                body = {
                                                        idAccount: req.body.idAccount,
                                                        idRestaurant: req.body.idRestaurant,
                                                        content: req.body.content,
                                                        image: image,
                                                        typePost: req.body.typePost,
                                                        createDate: Date.now(),
                                                };
                                        }
                                } else {
                                        try {

                                                const resultDiscount = await ModelDiscount.create(discount);
                                                if (resultDiscount !== null) {
                                                        if (req.files === undefined) {
                                                                body = {
                                                                        idAccount: req.body.idAccount,
                                                                        idRestaurant: req.body.idRestaurant,
                                                                        content: req.body.content,
                                                                        typePost: req.body.typePost,
                                                                        image: null,
                                                                        discount: resultDiscount._id,
                                                                        createDate: Date.now(),
                                                                };
                                                        } else {
                                                                const image = [];
                                                                for (let item of req.files) {
                                                                        image.push(`/uploads/${item.filename}`);
                                                                }
                                                                body = {
                                                                        idAccount: req.body.idAccount,
                                                                        idRestaurant: req.body.idRestaurant,
                                                                        content: req.body.content,
                                                                        image: image,
                                                                        typePost: req.body.typePost,
                                                                        discount: resultDiscount._id,
                                                                        createDate: Date.now(),
                                                                };
                                                        }
                                                } else {
                                                        format.error = true;
                                                        format.message = 'Thêm khuyến mãi không thành công !';
                                                }

                                        } catch (error) {
                                                format.error = true;
                                                format.message = error.message;
                                        }
                                }
                        } else {
                                if (req.files === undefined) {
                                        body = {
                                                idAccount: req.body.idAccount,
                                                idRestaurant: req.body.idRestaurant,
                                                content: req.body.content,
                                                typePost: req.body.typePost,
                                                image: null,
                                                createDate: Date.now(),
                                        };
                                } else {
                                        const image = [];
                                        for (let item of req.files) {
                                                image.push(`/uploads/${item.filename}`);
                                        }
                                        body = {
                                                idAccount: req.body.idAccount,
                                                idRestaurant: req.body.idRestaurant,
                                                content: req.body.content,
                                                image: image,
                                                typePost: req.body.typePost,
                                                createDate: Date.now(),
                                        };
                                }
                        }
                        if (body !== null) {
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

app.put('/comment-post/idPost/:idPost/idAccount/:idAccount', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idPost = req.params.idPost;
        const idAccount = req.params.idAccount;
        const contentComment = req.body.content;
        const idReply = req.body.idReply;
        try {
                const resultPost = await ModelPost.findById(idPost);
                if (resultPost === null) {
                        format.error = true;
                        format.message = 'Bài viết này không tồn tại !';
                } else {
                        let commentList = resultPost.comment;
                        if (idReply === null) {
                                let comment = {
                                        idAccount: idAccount,
                                        content: contentComment,
                                        createDate: Date.now(),
                                };
                                commentList.push(comment);
                        } else {
                                for (let i = 0; i < commentList.length; i++) {
                                        const resultBufferIdComment = new Uint8Array(commentList[i]._id.id.buffer, commentList[i]._id.id.byteOffset, commentList[i]._id.id.length);
                                        const convertStringBufferIdComment = resultBufferIdComment.toString();
                                        const convertBufferIdReply = Buffer.from(idReply, 'hex');
                                        const resultBufferIdReply = new Uint8Array(convertBufferIdReply.buffer, convertBufferIdReply.byteOffset, convertBufferIdReply.length);
                                        const convertStringBufferIdReply = resultBufferIdReply.toString();
                                        if (convertStringBufferIdComment === convertStringBufferIdReply) {
                                                let listReply = commentList[i].reply;
                                                listReply.push({
                                                        idAccount: idAccount,
                                                        content: contentComment,
                                                        createDate: Date.now(),
                                                });
                                                commentList[i].reply = listReply;
                                                break;
                                        }
                                }
                        }
                        if (idAccount !== resultPost.idAccount) {
                                const resultUser = await ModelUser.findById(idAccount);
                                const notification = {
                                        idAccount: resultPost.idAccount,
                                        idDetail: resultPost._id,
                                        title: resultUser.name,
                                        content: `đã bình luận về bài viết của bạn "${resultPost.content}"`,
                                        image: resultUser.avatar,
                                        type: 'post',
                                        createDate: Date.now()
                                };
                                await ModelNotification.create(notification);
                        }
                        const updatePost = await ModelPost.updateOne({ _id: idPost }, { comment: commentList });
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

app.put('/like-comment/idPost/:idPost/idAccount/:idAccount/idComment/:idComment', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idPost = req.params.idPost;
        const idAccount = req.params.idAccount;
        const idComment = req.params.idComment;
        const idCommentReply = req.body.idCommentReply;
        try {
                const post = await ModelPost.findById(idPost);
                if (post === null) {
                        format.error = true;
                        format.message = 'Bài viết không tồn tại !';
                } else {
                        let commentList = post.comment;
                        const like = {
                                idAccount: idAccount,
                                createDate: Date.now(),
                        };
                        if (idCommentReply === null) {
                                for (let i = 0; i < commentList.length; i++) {
                                        const resultBufferIdComment = new Uint8Array(commentList[i]._id.id.buffer, commentList[i]._id.id.byteOffset, commentList[i]._id.id.length);
                                        const convertStringBufferIdComment = resultBufferIdComment.toString();
                                        const convertBufferIdCommentRequest = Buffer.from(idComment, 'hex');
                                        const resultBufferIdCommentRequest = new Uint8Array(convertBufferIdCommentRequest.buffer, convertBufferIdCommentRequest.byteOffset, convertBufferIdCommentRequest.length);
                                        const convertStringBufferIdCommentRequest = resultBufferIdCommentRequest.toString();
                                        if (convertStringBufferIdComment === convertStringBufferIdCommentRequest) {
                                                let likeList = commentList[i].like;
                                                let checkExist = false;
                                                let position = null;
                                                for (let j = 0; j < likeList.length; j++) {
                                                        if (idAccount === likeList[j].idAccount) {
                                                                checkExist = true;
                                                                position = j;
                                                                break;
                                                        }
                                                }
                                                if (checkExist) {
                                                        likeList.splice(position, 1);
                                                } else {
                                                        likeList.push(like);
                                                        if (idAccount !== post.idAccount) {
                                                                const resultUser = await ModelUser.findById(idAccount);
                                                                const notification = {
                                                                        idAccount: commentList[i].idAccount,
                                                                        idDetail: post._id,
                                                                        title: resultUser.name,
                                                                        content: `đã thích bình luận của bạn "${commentList[i].content}"`,
                                                                        image: resultUser.avatar,
                                                                        type: 'post',
                                                                        createDate: Date.now()
                                                                };
                                                                await ModelNotification.create(notification);
                                                        }
                                                }
                                                commentList[i].like = likeList;
                                                break;
                                        }
                                }
                        } else {
                                for (let i = 0; i < commentList.length; i++) {
                                        const resultBufferIdComment = new Uint8Array(commentList[i]._id.id.buffer, commentList[i]._id.id.byteOffset, commentList[i]._id.id.length);
                                        const convertStringBufferIdComment = resultBufferIdComment.toString();
                                        const convertBufferIdCommentRequest = Buffer.from(idComment, 'hex');
                                        const resultBufferIdCommentRequest = new Uint8Array(convertBufferIdCommentRequest.buffer, convertBufferIdCommentRequest.byteOffset, convertBufferIdCommentRequest.length);
                                        const convertStringBufferIdCommentRequest = resultBufferIdCommentRequest.toString();
                                        if (convertStringBufferIdComment === convertStringBufferIdCommentRequest) {
                                                for (let j = 0; j < commentList[i].reply.length; j++) {
                                                        const resultBufferIdCommentReply = new Uint8Array(commentList[i].reply[j]._id.id.buffer, commentList[i].reply[j]._id.id.byteOffset, commentList[i].reply[j]._id.id.length);
                                                        const convertStringBufferIdCommentReply = resultBufferIdCommentReply.toString();
                                                        const convertBufferIdCommentReplyRequest = Buffer.from(idCommentReply, 'hex');
                                                        const resultBufferIdCommentReplyRequest = new Uint8Array(convertBufferIdCommentReplyRequest.buffer, convertBufferIdCommentReplyRequest.byteOffset, convertBufferIdCommentReplyRequest.length);
                                                        const convertStringBufferIdCommentReplyRequest = resultBufferIdCommentReplyRequest.toString();
                                                        if (convertStringBufferIdCommentReply === convertStringBufferIdCommentReplyRequest) {
                                                                let likeList = commentList[i].reply[j].like;
                                                                let checkExist = false;
                                                                let position = null;
                                                                for (let q = 0; q < likeList.length; j++) {
                                                                        if (idAccount === likeList[q].idAccount) {
                                                                                checkExist = true;
                                                                                position = q;
                                                                                break;
                                                                        }
                                                                }
                                                                if (checkExist) {
                                                                        likeList.splice(position, 1);
                                                                } else {
                                                                        likeList.push(like);
                                                                        if (idAccount !== post.idAccount) {
                                                                                const resultUser = await ModelUser.findById(idAccount);
                                                                                const notification = {
                                                                                        idAccount: commentList[i].reply[j].idAccount,
                                                                                        idDetail: post._id,
                                                                                        title: resultUser.name,
                                                                                        content: `đã thích bình luận của bạn "${commentList[i].reply[j].content}"`,
                                                                                        image: resultUser.avatar,
                                                                                        type: 'post',
                                                                                        createDate: Date.now()
                                                                                };
                                                                                await ModelNotification.create(notification);
                                                                        }
                                                                }
                                                                commentList[i].reply[j].like = likeList;
                                                                break;
                                                        }
                                                }
                                        }
                                }
                        }

                        const updatePost = await ModelPost.updateOne({ _id: idPost }, { comment: commentList });
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


app.delete('/idPost/:idPost', async (req, res) => {
        let format = {
                error: false,
                message: '',
                data: null
        };
        const idPost = req.params.idPost;
        try {
                const resultDelete = await ModelPost.deleteOne({ _id: idPost });
                if (resultDelete.ok === 1) {
                        format.message = 'Xóa thành công bài viết !';
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