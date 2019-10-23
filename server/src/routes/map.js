const app = module.exports = require('express')();
const ModelRestaurant = require('../models/restaurant');
const { GOOGLE_API_KEY } = require('../config');
const distance = require('google-distance-matrix');
const ModelFriend = require('../models/friend');
const ModelUser = require('../models/user');
const { idClientConnect, io } = require('../socket');


distance.key(GOOGLE_API_KEY);
distance.language('vn');

app.get('/closest-distance/latitude/:latitude/longitude/:longitude', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
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
                                        geolocation: {
                                                latitude: item.position.latitude,
                                                longitude: item.position.longitude
                                        }
                                });
                        }
                        distance.matrix(origins, destinations, function (err, distances) {
                                if (err) {
                                        format.error = true;
                                        format.message = err.message;
                                        res.json(format);
                                }
                                if (!distances) {
                                        format.error = true;
                                        format.message = 'no distances';
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

app.get('/get-position-friend/idAccount/:idAccount', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
        };
        const idAccount = req.params.idAccount;
        try {
                const friend = await ModelFriend.find({ idAccountClient: idAccount, status: 'friend' });
                if (friend.length === 0) {
                        format.error = true;
                        format.message = 'Không có bạn bè';
                } else {
                        let listClientOnline = [];
                        for (let i = 0; i < friend.length; i++) {
                                for (let j = 0; j < idClientConnect.length; j++) {
                                        if (idClientConnect[j].location !== null) {
                                                if (friend[i].idAccountFriend == idClientConnect[j].idAccount) {
                                                        let user = await ModelUser.findById(friend[i].idAccountFriend);
                                                        if (user !== null) {
                                                                let ac = {
                                                                        _id: user._id,
                                                                        name: user.name,
                                                                        email: user.email,
                                                                        password: user.password,
                                                                        avatar: user.avatar,
                                                                        phone: user.phone,
                                                                        authorities: user.authorities,
                                                                        score: user.score,
                                                                        conversation: user.conversation,
                                                                        createDate: user.createDate,
                                                                        geolocation: idClientConnect[j].location
                                                                };
                                                                listClientOnline.push(ac);
                                                        }
                                                }
                                        }
                                }
                        }
                        format.data = listClientOnline;
                        format.message = 'ok';
                }
                res.json(format);
        } catch (error) {
                format.error = true;
                format.message = error.message;
                res.json(format);
        }
});


app.get('/get-position-stranger/idAccount/:idAccount/latitude/:latitude/longitude/:longitude', async (req, res) => {
        var format = {
                error: false,
                message: '',
                data: []
        };
        const idAccount = req.params.idAccount;
        const geolocation = {
                latitude: req.params.latitude,
                longitude: req.params.longitude
        };
        try {
                const friend = await ModelFriend.find({ idAccountClient: idAccount, status: 'friend' });
                let resultList = [];
                if (friend.length === 0) {
                        const userResult = await ModelUser.find({ authorities: 'client' });
                        for (let i = 0; i < userResult.length; i++) {
                                let checkExist = false;
                                let geolocationClientConnect = {};
                                for (let j = 0; j < idClientConnect.length; j++) {
                                        const convertBuffer = Buffer.from(idClientConnect[j].idAccount, 'hex');
                                        const resultBufferAccountOnline = new Uint8Array(convertBuffer.buffer, convertBuffer.byteOffset, convertBuffer.length);
                                        const convertStringBufferAccountOnline = resultBufferAccountOnline.toString();
                                        const userId = userResult[i]._id.id;
                                        const resultBufferUserResult = new Uint8Array(userId.buffer, userId.byteOffset, userId.length);
                                        const convertStringBufferUserResult = resultBufferUserResult.toString();
                                        const convertBufferAccount = Buffer.from(idAccount, 'hex');
                                        const resultBufferAccount = new Uint8Array(convertBufferAccount.buffer, convertBufferAccount.byteOffset, convertBufferAccount.length);
                                        const convertStringBufferAccount = resultBufferAccount.toString();
                                        if (convertStringBufferUserResult === convertStringBufferAccount) {
                                                checkExist = false;
                                                break;
                                        } else {
                                                if (convertStringBufferAccountOnline === convertStringBufferUserResult) {
                                                        checkExist = true;
                                                        geolocationClientConnect = idClientConnect[j].location;
                                                        break;
                                                } else {
                                                        checkExist = false;
                                                }
                                        }
                                }
                                if (checkExist) {
                                        let ac = {
                                                _id: userResult[i]._id,
                                                name: userResult[i].name,
                                                email: userResult[i].email,
                                                password: userResult[i].password,
                                                avatar: userResult[i].avatar,
                                                phone: userResult[i].phone,
                                                authorities: userResult[i].authorities,
                                                score: userResult[i].score,
                                                conversation: userResult[i].conversation,
                                                createDate: userResult[i].createDate,
                                                geolocation: geolocationClientConnect,
                                        };
                                        resultList.push(ac);
                                }
                        }
                        format.message = 'khong ban be';
                } else {
                        const userResult = await ModelUser.find({ authorities: 'client' });
                        let listUnFriend = [];
                        for (let j = 0; j < userResult.length; j++) {
                                let checkExist = false;
                                for (let i = 0; i < friend.length; i++) {
                                        let idAccountFriend = friend[i].idAccountFriend;
                                        const convertBuffer = Buffer.from(idAccountFriend, 'hex');
                                        const resultBufferFriend = new Uint8Array(convertBuffer.buffer, convertBuffer.byteOffset, convertBuffer.length);
                                        const convertStringBufferFriend = resultBufferFriend.toString();
                                        let userId = userResult[j]._id.id;
                                        const resultBufferUserResult = new Uint8Array(userId.buffer, userId.byteOffset, userId.length);
                                        const convertStringBufferUserResult = resultBufferUserResult.toString();
                                        const convertBufferAccount = Buffer.from(idAccount, 'hex');
                                        const resultBufferAccount = new Uint8Array(convertBufferAccount.buffer, convertBufferAccount.byteOffset, convertBufferAccount.length);
                                        const convertStringBufferAccount = resultBufferAccount.toString();
                                        if (convertStringBufferUserResult === convertStringBufferAccount) {
                                                checkExist = true;
                                                break;
                                        } else {
                                                if (convertStringBufferFriend === convertStringBufferUserResult) {
                                                        checkExist = true;
                                                        break;
                                                } else {
                                                        checkExist = false;
                                                }
                                        }

                                }
                                if (!checkExist) {
                                        listUnFriend.push(userResult[j]);
                                }
                        }
                        for (let i = 0; i < listUnFriend.length; i++) {
                                let checkExist = false;
                                let geolocationClientConnect = {};
                                for (let q = 0; q < idClientConnect.length; q++) {
                                        const convertBuffer = Buffer.from(idClientConnect[q].idAccount, 'hex');
                                        const resultBufferAccountOnline = new Uint8Array(convertBuffer.buffer, convertBuffer.byteOffset, convertBuffer.length);
                                        const convertStringBufferAccountOnline = resultBufferAccountOnline.toString();
                                        let userId = listUnFriend[i]._id.id;
                                        const resultBufferUserResult = new Uint8Array(userId.buffer, userId.byteOffset, userId.length);
                                        const convertStringBufferUserResult = resultBufferUserResult.toString();
                                        if (idClientConnect[q].location != null && convertStringBufferAccountOnline === convertStringBufferUserResult) {
                                                checkExist = true;
                                                geolocationClientConnect = idClientConnect[q].location;
                                                break;
                                        }
                                }
                                if (checkExist) {
                                        let ac = {
                                                _id: listUnFriend[i]._id,
                                                name: listUnFriend[i].name,
                                                email: listUnFriend[i].email,
                                                password: listUnFriend[i].password,
                                                avatar: listUnFriend[i].avatar,
                                                phone: listUnFriend[i].phone,
                                                authorities: listUnFriend[i].authorities,
                                                score: listUnFriend[i].score,
                                                conversation: listUnFriend[i].conversation,
                                                createDate: listUnFriend[i].createDate,
                                                geolocation: geolocationClientConnect,
                                        };
                                        resultList.push(ac);
                                }
                        }
                        format.message = 'ban be';
                }
                let origins = [`${geolocation.latitude},${geolocation.longitude}`];
                let destinations = [];
                for (item of resultList) {
                        let convert = `${item.geolocation.latitude},${item.geolocation.longitude}`;
                        destinations.push(convert);
                }
                distance.matrix(origins, destinations, function (err, distances) {
                        if (err) {
                                format.error = true;
                                format.message = err.message;
                        }
                        if (!distances) {
                                format.error = true;
                                format.message = 'no distances';
                        }
                        if (distances.status == 'OK') {
                                for (var i = 0; i < origins.length; i++) {
                                        for (var j = 0; j < destinations.length; j++) {
                                                if (distances.rows[i].elements[j].status == 'OK') {
                                                        resultList[j].distance = distances.rows[i].elements[j].distance.value;
                                                        resultList[j].duration = distances.rows[i].elements[j].duration.value;
                                                }
                                        }
                                }
                        }
                        resultList.sort((a, b) => {
                                return a.distance - b.distance;
                        });
                        let list = [];
                        for (item of resultList) {
                                if (item.distance < 1500) {
                                        list.push(item);
                                }
                        }
                        format.data = list;
                        res.json(format);
                });
        } catch (error) {
                format.error = true;
                format.message = error.message;
        }
});
