const app = module.exports = require('express')();
const { idAdminApp, io } = require('../socket');
const ModelConversation = require('../models/conversation');
const ModelMessage = require('../models/message');
const ModelUser = require('../models/user');
const lodash = require('lodash/array');

app.get('/list-message/idConversation/:idConversation/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        const idConversation = req.params.idConversation;
        const page = parseInt(req.params.page);
        try {
                const countItem = await ModelMessage.countDocuments({ idConversation: idConversation });
                format.count_item = countItem;
                let total_page = countItem / 10;
                if (countItem === 0) {
                        format.message = 'Không có tin nhắn nào !';
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
                                        const results = await ModelMessage.find({ idConversation: idConversation }).sort({ createDate: -1 }).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có thông báo !';
                                                format.data = results;
                                        }
                                } else {
                                        format.page = page;
                                        const results = await ModelMessage.find({ idConversation: idConversation }).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có thông báo !';
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

app.get('/get-new-message/idConversation/:idConversation', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const idConversation = req.params.idConversation;
        try {
                const result = await ModelMessage.findOne({ idConversation: idConversation }).sort({ createDate: -1 });
                if (result === null) {
                        format.error = true;
                        format.message = 'ID cuộc trò chuyện không chính xác !';
                } else {
                        format.message = 'ok';
                        format.data = result;
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.post('/send-message', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        const data = {
                idConversation: req.body.idConversation,
                idSender: req.body.idSender,
                content: req.body.content,
                createDate: Date.now()
        };

        try {
                const message = await ModelMessage.create(data);
                if (message === null) {
                        format.error = true;
                        format.message = 'Không gửi được tin nhắn !';
                } else {
                        await ModelConversation.findByIdAndUpdate(data.idConversation, { $set: { updateDate: Date.now() } }, { useFindAndModify: false });
                        format.message = 'ok';
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});