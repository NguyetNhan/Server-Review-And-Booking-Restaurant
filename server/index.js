var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var debug = require('debug')('Server');
var http = require('http');
var lodash = require('lodash/array');

var app = express();
var server = http.createServer(app);
//var io = require('socket.io')(server);
var { io, idClientConnect } = require('./src/socket');
io.attach(server);

var indexRouter = require('./src/routes/index');
var configServer = require('./src/config');

//var port = process.env.port || 3000;

var port = normalizePort(process.env.PORT || configServer.portServer);
app.set('port', port);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json());

// create application/x-www-form-urlencoded parser 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//kết nối database
//console.log(config.getDBConnetionString());
mongoose.connect(configServer.urlDatabase, { useNewUrlParser: true, autoIndex: false });

// add router
app.use(indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
        next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        // render the error page
        res.status(err.status || 500);
        res.render('error');
});


io.on('connection', function (socket) {
        socket.on('infoAccount', (info) => {
                idClientConnect.push({
                        idSocket: socket.id,
                        idAccount: info.idAccount,
                        location: info.location
                });
        });
        socket.on('idClientOnline', (fn) => {
                fn(idClientConnect);
        });
        socket.on('disconnect', () => {
                lodash.remove(idClientConnect, (item) => {
                        return item.idSocket === socket.id;
                });
                io.emit('idClientOnline', idClientConnect);
        });
        socket.on('create-room', (data) => {
                socket.join(data);
                socket.idRoomChat = data;
        });
        socket.on('leave-room-chat', (data) => {
                socket.leave(data);
        });
        socket.on('user-send-message', (data) => {
                io.sockets.in(socket.idRoomChat).emit('server-send-message-chat', data);
        });
        socket.on('user-typing', (data) => {
                io.sockets.in(socket.idRoomChat).emit('server-send-status-typing', data);
        });
        socket.on('user-stop-typing', (data) => {
                io.sockets.in(socket.idRoomChat).emit('server-send-status-stop-typing', data);
        });
});



server.listen(app.get('port'), function () {
        console.log('app listening on port : ', app.get('port'));
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
                // named pipe
                return val;
        }

        if (port >= 0) {
                // port number
                return port;
        }

        return false;
}


/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
        if (error.syscall !== 'listen') {
                throw error;
        }

        var bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
                case 'EACCES':
                        // eslint-disable-next-line no-console
                        console.error(bind + ' requires elevated privileges');
                        process.exit(1);
                        break;
                case 'EADDRINUSE':
                        console.error(bind + ' is already in use');
                        process.exit(1);
                        break;
                default:
                        throw error;
        }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
        var addr = server.address();
        var bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
        debug('Listening on ' + bind);
}
