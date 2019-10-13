const app = module.exports = require('express')();
const ModelNotification = require('../models/notification');
const ModelRestaurant = require('../models/restaurant');
const ModelUser = require('../models/user');
const ModelFollow = require('../models/follow');

app.get('/is-checked-follow/idRestaurant/:idRestaurant/idClient/:idClient', async (req, res) => {
        var format = {
                error: false,
                message: '',
                isFollowed: false,
                data: null
        };
        const idRestaurant = req.params.idRestaurant;
        const idClient = req.params.idClient;
        try {
                const follow = await ModelFollow.findOne({ idRestaurantFollow: idRestaurant, idAccountFollow: idClient });
                if (follow !== null) {
                        format.message = 'ok';
                        format.isFollowed = true;
                } else {
                        format.isFollowed = false;
                }
                format.data = follow;
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});

app.post('/change-follow', async (req, res) => {
        var format = {
                error: false,
                message: '',
                isFollowed: false,
                data: null
        };
        const idRestaurant = req.body.idRestaurant;
        const idClient = req.body.idClient;
        try {
                const follow = await ModelFollow.findOne({ idRestaurantFollow: idRestaurant, idAccountFollow: idClient });
                if (follow === null) {
                        const result = await ModelFollow.create({
                                idAccountFollow: idClient,
                                idRestaurantFollow: idRestaurant,
                                createDate: Date.now()
                        });
                        if (result !== null) {
                                format.message = 'Thêm follow thành công !';
                                format.isFollowed = true;
                                format.data = result;
                        }
                } else {
                        const result = await ModelFollow.deleteOne({ idRestaurantFollow: idRestaurant, idAccountFollow: idClient });
                        if (result.ok === 1) {
                                format.message = 'Bỏ follow thành công !';
                                format.isFollowed = false;
                        }
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});