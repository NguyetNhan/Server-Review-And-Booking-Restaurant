const app = module.exports = require('express')();
const { idAdminApp, io } = require('../socket');
const lodash = require('lodash/array');
const Model = require('../models/notification');


app.get('/', (req, res) => {
        res.send('ok');
});

app.get('/idAccount/:id/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        try {
                const idAccount = req.params.id;
                const page = parseInt(req.params.page);
                const countItem = await Model.countDocuments({ idAccount: idAccount });
                format.count_item = countItem;
                let total_page = countItem / 10;
                if (countItem === 0) {
                        format.message = 'Không có thông báo !';
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
                                        format.page = page;
                                        const results = await Model.find({ idAccount: idAccount }).sort({ createDate: -1 }).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                                res.json(format);
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có thông báo !';
                                                format.data = results;
                                                res.json(format);
                                        }
                                } else {
                                        format.page = page;
                                        const results = await Model.find({ idAccount: idAccount }).sort({ createDate: -1 }).skip((page - 1) * 10).limit(10);
                                        if (results.length > 0) {
                                                format.message = 'ok';
                                                format.data = results;
                                                res.json(format);
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có thông báo !';
                                                format.data = results;
                                                res.json(format);
                                        }
                                }
                        }
                }
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});             