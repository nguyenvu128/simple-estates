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
// const getListComments = async (req, res) => {
//     try {
//         const {type, page, commentId, postId} = req.query;
//         if(type !== "POST" && type !== "COMMENT") {
//             return res.status(HttpStatus.BAD_REQUEST).json({
//                 message: "Yêu cầu không hợp lệ"
//             });
//         }
//
//         const pagination = PostController.extractPagination(req.query, res);
//         if(pagination === false) {
//             return;
//         }
//
//         if(type === "POST") {
//             const isValidatorPostId = isInvalidType(postId, res);
//             if(isValidatorPostId === false) {
//                 return;
//             }
//
//             const comment = await CommentsModel.find({postId: postId})
//
//         }
//     } catch (e) {
//         console.log(e);
//         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//             message: JSON.stringify(e)
//         });
//     }
// };