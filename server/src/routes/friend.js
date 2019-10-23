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