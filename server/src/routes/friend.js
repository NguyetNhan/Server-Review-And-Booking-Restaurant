const app = module.exports = require('express')();
const ModelNotification = require('../models/notification');
const ModelUser = require('../models/user');
const ModelFriend = require('../models/friend');

app.get('/get-friend/idAccount/:idAccount', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
        };
        const idAccount = req.params.idAccount;
        try {
                const result = await ModelFriend.find({ idAccountClient: idAccount, status: 'friend' });
                format.message = 'ok';
                format.data = result;
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.json(format);
        }
});

app.get('/get-friend-request/idAccount/:idAccount', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
        };
        const idAccount = req.params.idAccount;
        try {
                const result = await ModelFriend.find({ idAccountFriend: idAccount, status: 'waiting' });
                format.message = 'ok';
                format.data = result;
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.json(format);
        }
});

app.get('/check-is-friend/idAccountClient/:idAccountClient/idAccountFriend/:idAccountFriend', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idAccountClient = req.params.idAccountClient;
        const idAccountFriend = req.params.idAccountFriend;
        try {
                const result = await ModelFriend.findOne({ idAccountClient, idAccountFriend });
                if (result === null) {
                        format.message = 'Chưa kết bạn !';
                        format.data = null;
                } else {
                        format.message = 'ok';
                        format.data = result.status;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.json(format);
        }
});

app.post('/send-friend-request', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const body = {
                idAccountClient: req.body.idAccountClient,
                idAccountFriend: req.body.idAccountFriend,
                status: 'waiting',
                createDate: Date.now(),
        };
        try {
                const result = await ModelFriend.create(body);
                if (result === null) {
                        format.error = true;
                        format.message = 'Gửi lời mời kết bạn thất bại !';
                } else {
                        const user = await ModelUser.findById(body.idAccountClient);
                        if (user !== null) {
                                await ModelNotification.create({
                                        idAccount: body.idAccountFriend,
                                        idDetail: result._id,
                                        title: user.name,
                                        content: 'đã gửi lời mời kết bạn cho bạn !',
                                        image: user.avatar,
                                        type: 'friend',
                                        createDate: Date.now(),
                                });
                        }
                        format.data = result;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.json(format);
        }
});

app.put('/confirm-friend/idFriendRequest/:idFriendRequest/status/:status', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idFriendRequest = req.params.idFriendRequest;
        const status = req.params.status;
        try {
                const resultFriend = await ModelFriend.findById(idFriendRequest);
                if (resultFriend === null) {
                        format.error = true;
                        format.message = 'Lời mời kết bạn chưa tồn tại !';
                } else {
                        if (status === 'agree') {
                                const resultUpdate = await ModelFriend.updateOne({ _id: idFriendRequest }, { status: 'friend', createDate: Date.now() });
                                await ModelFriend.create({
                                        idAccountClient: resultFriend.idAccountFriend,
                                        idAccountFriend: resultFriend.idAccountClient,
                                        status: 'friend',
                                        createDate: Date.now(),
                                });
                                const resultUser = await ModelUser.findById(resultFriend.idAccountFriend);
                                if (resultUser !== null) {
                                        await ModelNotification.create({
                                                idAccount: resultFriend.idAccountClient,
                                                idDetail: idFriendRequest,
                                                title: resultUser.name,
                                                content: 'đã đồng ý kết bạn với bạn !',
                                                image: resultUser.avatar,
                                                type: 'friend',
                                                createDate: Date.now()
                                        });
                                }
                                format.message = 'đã trở thành bạn bè !';
                        } else if (status === 'remove') {
                                const resultRemove = await ModelFriend.deleteOne({ _id: idFriendRequest });
                                if (resultRemove.ok === 1) {
                                        format.message = 'Xóa thành công !';
                                }
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.json(format);
        }
});

app.post('/contacts', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
        };
        const bodyData = {
                idAccount: req.body.idAccount,
                phoneList: req.body.phoneList
        };
        try {
                const userResult = await ModelUser.find({ authorities: 'client' });
                if (userResult.length === 0) {
                        format.error = true;
                        format.message = 'Chưa có tài khoản nào !';
                } else {
                        for (let i = 0; i < userResult.length; i++) {
                                for (let j = 0; j < bodyData.phoneList.length; j++) {
                                        if (userResult[i].phone === bodyData.phoneList[j]) {
                                                if (userResult[i]._id != bodyData.idAccount) {
                                                        const checkFriend = await ModelFriend.findOne({
                                                                idAccountClient: bodyData.idAccount,
                                                                idAccountFriend: userResult[i]._id
                                                        });
                                                        if (checkFriend === null) {
                                                                await ModelFriend.create({
                                                                        idAccountClient: bodyData.idAccount,
                                                                        idAccountFriend: userResult[i]._id,
                                                                        status: 'friend',
                                                                        createDate: Date.now(),
                                                                });
                                                                await ModelFriend.create({
                                                                        idAccountClient: userResult[i]._id,
                                                                        idAccountFriend: bodyData.idAccount,
                                                                        status: 'friend',
                                                                        createDate: Date.now(),
                                                                });
                                                        }
                                                }
                                        }
                                }
                        }
                        const friendList = await ModelFriend.find({ idAccountClient: bodyData.idAccount, status: 'friend' });
                        format.data = friendList;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.json(format);
        }
});