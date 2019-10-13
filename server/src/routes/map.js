const app = module.exports = require('express')();
const ModelRestaurant = require('../models/restaurant');
const { GOOGLE_API_KEY } = require('../config');
const distance = require('google-distance-matrix');


distance.key(GOOGLE_API_KEY);
distance.language('vn');

app.get('/closest-distance/latitude/:latitude/longitude/:longitude', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: null
        };
        try {
                const latitude = req.params.latitude;
                const longitude = req.params.longitude;
                var origins = [`${latitude},${longitude}`];
                var destinations = [];
                var listRestaurant = [];
                var resultRestaurant = await ModelRestaurant.find({ status: 'ok' });
                if (resultRestaurant.length > 0) {
                        for (item of resultRestaurant) {
                                var convert = `${item.position.latitude},${item.position.longitude}`;
                                destinations.push(convert);
                                listRestaurant.push({
                                        _id: item._id,
                                        name: item.name,
                                        introduce: item.introduce,
                                        idAdmin: item.idAdmin,
                                        star: item.star,
                                        imageRestaurant: item.imageRestaurant,
                                        phone: item.phone,
                                        address: item.address,
                                        status: item.status,
                                        type: item.type,
                                        time_activity: item.time_activity,
                                        follow: item.follow,
                                        createDate: item.createDate,
                                        position: {
                                                latitude: item.position.latitude,
                                                longitude: item.position.longitude
                                        }
                                });
                        }
                        distance.matrix(origins, destinations, function (err, distances) {
                                if (err) {
                                        format.error = true;
                                        format.message = err.message;
                                        format.data = err;
                                        res.json(format);
                                }
                                if (!distances) {
                                        format.error = true;
                                        format.message = 'no distances';
                                        format.data = err;
                                        res.json(format);
                                }
                                if (distances.status == 'OK') {
                                        for (var i = 0; i < origins.length; i++) {
                                                for (var j = 0; j < destinations.length; j++) {
                                                        if (distances.rows[i].elements[j].status == 'OK') {
                                                                listRestaurant[j].distance = distances.rows[i].elements[j].distance.value;
                                                                listRestaurant[j].duration = distances.rows[i].elements[j].duration.value;
                                                        }
                                                }
                                        }
                                }
                                listRestaurant.sort((a, b) => {
                                        return a.distance - b.distance;
                                });
                                format.message = 'ok';
                                format.data = listRestaurant;
                                res.json(format);
                        });
                } else {
                        format.message = 'Không có nhà hàng nào !';
                        res.json(format);
                }
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.status(500).json(format);
        }
});