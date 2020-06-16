const mongoose = require('mongoose');
const HttpStatus = require('http-status-codes');
const CommentsModel = require('../models/comments.model');
const PostsModel = require('../models/post.model');

const isInvalidType = (str, res) => {

    if(!str) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Không hợp lệ"
        });

        return false;
    }

    if(str.length !== 24) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Không hợp lệ"
        });

        return false;
    }

    return true;
};

const createComment = async (req, res) => {
    try {
        const {type, postId, commentId, content} = req.body;
        let commentData = {};
        if(type !== "POST" && type !== "COMMENT") {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không hợp lệ "
            });
        }

        if(!content) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không hợp lệ"
            });
        }

        if(type === "POST") {
            const isValidatorPostId = isInvalidType(postId, res);
            if(isValidatorPostId === false) {
                return;
            }

            const post = await PostsModel.findOne({_id: postId});

            if(!post) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Không hợp lệ"
                });
            }

            commentData = {
                userId: req.user._id,
                postId: mongoose.Types.ObjectId(postId),
                text: content,
            };
        }

        if(type === "COMMENT") {
            const isValidatorCommentId = isInvalidType(commentId, res);
            if(isValidatorCommentId === false) {
                return;
            }

            const comment = await CommentsModel.findOne({_id: commentId});


            if(!comment) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Không hợp lệ"
                });
            }

            commentData = {
                userId: req.user._id,
                text: content,
                parentCommentId: mongoose.Types.ObjectId(commentId)
            };
        }

        const commentModel= new CommentsModel (commentData);
        await commentModel.save();
        return res.status(HttpStatus.OK).json({
            message: "Thành công"
        });

    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        });
    }
};

module.exports = {
    createComment
};