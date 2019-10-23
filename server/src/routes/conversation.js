const app = module.exports = require('express')();
const { idAdminApp, io } = require('../socket');
const ModelConversation = require('../models/conversation');
const ModelMessage = require('../models/message');
const ModelUser = require('../models/user');
const lodash = require('lodash/array');
app.post('/check-conversation', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idAccountSend = req.body.idAccountSend;
        const idAccountReceiver = req.body.idAccountReceiver;
        try {
                const accountSend = await ModelUser.findById(idAccountSend);
                const accountReceiver = await ModelUser.findById(idAccountReceiver);
                if (accountSend === null) {
                        format.error = true;
                        format.message = 'Id Account không tồn tại !';
                } else if (accountReceiver === null) {
                        format.error = true;
                        format.message = 'Id người nhận không tồn tại !';
                } else {
                        let listConversationSend = accountSend.conversation;
                        let checkExist = false;
                        for (item of listConversationSend) {
                                if (item.idUserReceiver === idAccountReceiver) {
                                        format.message = 'ok';
                                        format.data = item.idConversation;
                                        checkExist = true;
                                        break;
                                }
                        }
                        if (!checkExist) {
                                let listParticipant = [];
                                listParticipant.push(idAccountSend);
                                listParticipant.push(idAccountReceiver);
                                const resultConversation = await ModelConversation.create({
                                        participant: listParticipant,
                                        createDate: Date.now(),
                                        updateDate: Date.now()
                                });
                                if (resultConversation === null) {
                                        format.error = true;
                                        format.message = 'Không tạo được hộp thoại !';
                                } else {
                                        format.message = 'ok';
                                        format.data = resultConversation._id;
                                        let listConversationAccountSend = accountSend.conversation;
                                        const conversationAccountSend = {
                                                idConversation: resultConversation._id,
                                                idUserReceiver: idAccountReceiver,
                                                createDate: Date.now()
                                        };
                                        listConversationAccountSend.push(conversationAccountSend);
                                        await ModelUser.findByIdAndUpdate(idAccountSend, { $set: { conversation: listConversationAccountSend } }, { useFindAndModify: false });

                                        let listConversationAccountReceiver = accountReceiver.conversation;
                                        const conversationAccountReceiver = {
                                                idConversation: resultConversation._id,
                                                idUserReceiver: idAccountSend,
                                                createDate: Date.now()
                                        };
                                        listConversationAccountReceiver.push(conversationAccountReceiver);
                                        await ModelUser.findByIdAndUpdate(idAccountReceiver, { $set: { conversation: listConversationAccountReceiver } }, { useFindAndModify: false });
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

app.get('/list-conversation/idAccount/:idAccount/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        try {
                const idAccount = req.params.idAccount;
                const page = parseInt(req.params.page);
                const account = await ModelUser.findById(idAccount);
                if (account === null) {
                        format.error = true;
                        format.message = 'ID tài khoản không tồn tại !';
                } else {
                        const listConversationAccount = account.conversation;
                        let listConversation = [];
                        if (listConversationAccount.length === 0) {
                                format.message = 'Không có cuộc trò chuyện nào !';
                                format.page = page;
                                format.data = [];
                        } else {
                                for (item of listConversationAccount) {
                                        const countMessage = await ModelMessage.countDocuments({ idConversation: item.idConversation });
                                        if (countMessage > 0) {
                                                const conversation = await ModelConversation.findById(item.idConversation);
                                                if (conversation !== null) {
                                                        listConversation.push(conversation);
                                                }
                                        }
                                }
                                listConversation.sort((a, b) => {
                                        return b.updateDate - a.updateDate;
                                });
                                const countItem = listConversation.length;
                                format.count_item = countItem;
                                let total_page = countItem / 10;
                                if (countItem === 0) {
                                        format.message = 'Không có cuộc trò chuyện nào !';
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
                                                        let resultConversation = [];
                                                        for (let i = 0; i < 10; i++) {
                                                                if (listConversation[i] !== undefined) {
                                                                        resultConversation.push(listConversation[i]);
                                                                }
                                                        }
                                                        format.message = 'ok';
                                                        format.data = resultConversation;
                                                } else {
                                                        format.page = page;
                                                        let positionRead = ((page - 1) * 10) - 1;
                                                        for (let i = positionRead; i < positionRead + 10; i++) {
                                                                if (listConversation[i] !== undefined)
                                                                        resultConversation.push(listConversation[i]);
                                                        }
                                                        format.data = resultConversation;
                                                        format.message = 'ok';
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

