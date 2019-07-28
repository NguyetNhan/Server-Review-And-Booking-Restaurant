var app = module.exports = require('express')();
//var router = express.Router();
//var app = express();

/* GET home page. */
app.get('/', function (req, res, next) {
        res.render('index');
});

app.use('/auth', require('./auth'));