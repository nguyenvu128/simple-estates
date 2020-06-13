const HttpStatus = require('http-status-codes');
const TokenModel = require('/models/tokens.model');
const UserModel = require('/models/users.model');

module.exports = async (req, res, next) => {
    const token = req.headers['token'] || req.query.token || req.body.token;

    if(!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Cần đăng nhập"
        });
    }

    const userToken = await TokenModel.findOne({token});
    if(!userToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Token không hợp lệ"
        });
    }

    const user = await UserModel.findOne({_id: userToken.userId});
    if(!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Token không hợp lệ"
        });
    }

    req.user = user;
    return next();
};