const app = module.exports = require('express')();
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');

app.get('/content-search/:contentSearch', async (req, res) => {
        var format = {
                error: false,
                message: '',
                count_item: null,
                data: []
        };
        const contentSearch = req.params.contentSearch;
        var filterRestaurant = {};
        var filterUser = {};
        if (Number.isInteger(contentSearch)) {
                filterRestaurant = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        address: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        type: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        phone: { $regex: contentSearch, $options: 'i' }
                                                }
                                        ]
                                },
                                {
                                        status: 'ok'
                                },
                        ]

                };
                filterUser = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        email: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        phone: { $regex: contentSearch, $options: 'i' }
                                                }
                                        ]
                                },
                                {
                                        authorities: 'client'
                                }
                        ]
                };
        } else {
                filterRestaurant = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        address: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        type: { $regex: contentSearch, $options: 'i' }
                                                },
                                        ]
                                },
                                {
                                        status: 'ok'
                                },
                        ]

                };
                filterUser = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        email: { $regex: contentSearch, $options: 'i' }
                                                },
                                        ]
                                },
                                {
                                        authorities: 'client'
                                }
                        ]

                };
        }

        try {
                const countItemClient = await ModelUser.countDocuments(filterUser);
                const countItemRestaurant = await ModelRestaurant.countDocuments(filterRestaurant);
                const resultRestaurant = await ModelRestaurant.find(filterRestaurant).limit(5);
                const resultUser = await ModelUser.find(filterUser).limit(5);
                format.message = 'ok';
                format.count_item = {
                        client: countItemClient,
                        restaurant: countItemRestaurant
                };
                format.data = {
                        restaurant: resultRestaurant,
                        client: resultUser
                };
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.get('/search-restaurant/content-search/:contentSearch/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        const contentSearch = req.params.contentSearch;
        const page = parseInt(req.params.page);
        var filterRestaurant = {};
        if (Number.isInteger(contentSearch)) {
                filterRestaurant = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        address: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        type: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        phone: { $regex: contentSearch, $options: 'i' }
                                                }
                                        ]
                                },
                                {
                                        status: 'ok'
                                },
                        ]
                };
        } else {
                filterRestaurant = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        address: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        type: { $regex: contentSearch, $options: 'i' }
                                                },
                                        ]
                                },
                                {
                                        status: 'ok'
                                },
                        ]
                };
        }
        try {
                const countItem = await ModelRestaurant.countDocuments(filterRestaurant);
                format.count_item = countItem;
                let total_page = countItem / 10;
                if (countItem === 0) {
                        format.message = 'Không có kết quả tìm kiếm nào !';
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
                                        const resultRestaurant = await ModelRestaurant.find(filterRestaurant).limit(10);
                                        if (resultRestaurant.length > 0) {
                                                format.message = 'ok';
                                                format.data = resultRestaurant;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có kết quả nào !';
                                                format.data = resultRestaurant;
                                        }
                                } else {
                                        format.page = page;
                                        const resultRestaurant = await ModelRestaurant.find(filterRestaurant).skip((page - 1) * 10).limit(10);
                                        if (resultRestaurant.length > 0) {
                                                format.message = 'ok';
                                                format.data = resultRestaurant;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có kết quả nào !';
                                                format.data = resultRestaurant;
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

app.get('/search-client/content-search/:contentSearch/page/:page', async (req, res) => {
        var format = {
                error: false,
                message: '',
                page: 1,
                total_page: '',
                count_item: '',
                data: []
        };
        const contentSearch = req.params.contentSearch;
        const page = parseInt(req.params.page);
        var filterUser = {};
        if (Number.isInteger(contentSearch)) {
                filterUser = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                        // name: userRegex
                                                },
                                                {
                                                        email: { $regex: contentSearch, $options: 'i' }
                                                },
                                                {
                                                        phone: { $regex: contentSearch, $options: 'i' }
                                                }
                                        ]
                                },
                                {
                                        authorities: 'client'
                                }
                        ]
                };
        } else {
                filterUser = {
                        $and: [
                                {
                                        $or: [
                                                {
                                                        name: { $regex: contentSearch, $options: 'i' },
                                                },
                                                {
                                                        email: { $regex: contentSearch, $options: 'i' }
                                                },
                                        ]
                                },
                                {
                                        authorities: 'client'
                                }
                        ]

                };
        }
        try {
                const countItem = await ModelUser.countDocuments(filterUser);
                format.count_item = countItem;
                let total_page = countItem / 10;
                if (countItem === 0) {
                        format.message = 'Không có kết quả tìm kiếm nào !';
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
                                        const resultUser = await ModelUser.find(filterUser).limit(10);
                                        if (resultUser.length > 0) {
                                                format.message = 'ok';
                                                format.data = resultUser;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có kết quả nào !';
                                                format.data = resultUser;
                                        }
                                } else {
                                        format.page = page;
                                        const resultUser = await ModelUser.find(filterUser).skip((page - 1) * 10).limit(10);
                                        if (resultUser.length > 0) {
                                                format.message = 'ok';
                                                format.data = resultUser;
                                        } else {
                                                format.error = false;
                                                format.message = 'Không có kết quả nào !';
                                                format.data = resultUser;
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