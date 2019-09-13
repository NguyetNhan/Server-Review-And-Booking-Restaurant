var app = module.exports = require('express')();
//var router = express.Router();
//var app = express();


/* GET home page. */
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