const app = module.exports = require('express')();
const lodash = require('lodash');
const ModelInvite = require('../models/invite');
const ModelOrder = require('../models/order');
const ModelNotification = require('../models/notification');
const ModelUser = require('../models/user');

app.get('/get-invite-list/idAccountClient/:idAccountClient', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
        };
        const idAccountClient = req.params.idAccountClient;
        try {
                const result = await ModelInvite.find({ idAccountClient: idAccountClient }).sort({ createDate: -1 });
                if (result.length === 0) {
                        format.message = 'Chưa có lời mời nào !';
                } else {
                        format.data = result;
                }
                res.json(format);
        } catch (error) {
                return {
                        error: true,
                        message: error.message
                };
        }
});

app.put('/confirm-invite/idInvite/:idInvite/status/:status', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idInvite = req.params.idInvite;
        const status = req.params.status;
        try {
                const invite = await ModelInvite.findById(idInvite);
                if (invite === null) {
                        format.error = true;
                        format.message = 'Lời mời không tồn tại !';
                } else {
                        const resultUpdateInvite = await ModelInvite.updateOne({ _id: idInvite }, { status: status });
                        const userClient = await ModelUser.findById(invite.idAccountClient);
                        if (resultUpdateInvite.ok === 1)
                                if (status === 'cancel') {
                                        format.message = 'Từ chối thành công !';
                                        const order = await ModelOrder.findById(invite.idOrder);
                                        await ModelNotification.create({
                                                idAccount: invite.idAccountInvite,
                                                idDetail: invite.idOrder,
                                                title: userClient.name,
                                                content: `đã từ chối tham dự đơn hàng ${invite.idOrder} !`,
                                                image: userClient.avatar,
                                                type: 'order',
                                                createDate: Date.now()
                                        });
                                        if (order === null) {
                                                format.error = true;
                                                format.message = 'Đơn hàng chưa tồn tại !';
                                        } else {
                                                let sumPerson = order.amountPerson;
                                                let listGuests = [];
                                                for (item of order.guests) {
                                                        if (item.idAccount !== invite.idAccountClient)
                                                                listGuests.push(item);
                                                }
                                                await ModelOrder.updateOne({ _id: order._id }, { amountPerson: sumPerson - 1, guests: listGuests });
                                                const inviteAfterUpdate = await ModelInvite.findById(idInvite);
                                                format.data = inviteAfterUpdate;
                                        }
                                } else {
                                        format.message = 'Đồng ý thành công !';
                                        await ModelNotification.create({
                                                idAccount: invite.idAccountInvite,
                                                idDetail: invite.idOrder,
                                                title: userClient.name,
                                                content: `đã đồng ý tham dự đơn hàng ${invite.idOrder} !`,
                                                image: userClient.avatar,
                                                type: 'order',
                                                createDate: Date.now()
                                        });
                                        const inviteAfterUpdate = await ModelInvite.findById(idInvite);
                                        format.data = inviteAfterUpdate;
                                }
                }
                res.json(format);
        } catch (error) {
                return {
                        error: true,
                        message: error.message
                };
        }
});
