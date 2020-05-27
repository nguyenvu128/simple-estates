const express = require('express');
const HttpStatus = require('http-status-codes');
const http = require('http')
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api', require('./routes/api'));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res
        .status(HttpStatus.NOT_IMPLEMENTED)
        .json({
            message: 'Unsupported api'
        })
});

// error handler
app.use(function (err, req, res, next) {
    const msg = err.message ? err.message : JSON.stringify(err);

    return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
            messages: msg
        });
});

module.exports = app;
