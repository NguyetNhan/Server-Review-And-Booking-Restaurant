var app = module.exports = require('express')();

app.get('/', function (req, res, next) {
        res.render('index');
});

app.get('/chat', function (req, res, next) {
        res.render('index');
});

app.use('/auth', require('./auth'));
app.use('/restaurant', require('./restaurant'));
app.use('/menu', require('./menu_restaurant'));
app.use('/notification', require('./notification'));
app.use('/map', require('./map'));
app.use('/order', require('./order'));
app.use('/reviews', require('./review'));
app.use('/follows', require('./follow'));
app.use('/search', require('./search'));
app.use('/conversation', require('./conversation'));
app.use('/message', require('./message'));
app.use('/friend', require('./friend'));
app.use('/invite', require('./invite'));
app.use('/post', require('./post'));
app.use('/discount', require('./discount'));