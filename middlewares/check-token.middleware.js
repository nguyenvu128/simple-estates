const HttpStatus = require('http-status-codes');
const UserModel = require('../models/users.model');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    const token = req.headers['token'] || req.query.token || req.body.token;

    if(!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Cần đăng nhập"
        });
    }

    const verifyToken = jwt.verify(token, process.env.private_key);
    const user = await UserModel.findOne({email: verifyToken.email});
    if(!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Token không hợp lệ"
        });
    }

    req.user = user;
    return next();
};