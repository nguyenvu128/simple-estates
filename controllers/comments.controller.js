const mongoose = require('mongoose');
const HttpStatus = require('http-status-codes');
const CommentsModel = require('../models/comments.model');

const createComment = async (req, res) => {
    try {
        const {type, postId, commentId, content} = req.body;
        if(type !== 'POST' || type !== 'COMMENT') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không hợp lệ"
            });
        }

        const query = {};
        if(type === 'POST') {
            if(!postId) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Không hợp lệ"
                });
            }

            if(postId.length !== 24) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Không hợp lệ"
                });
            }

            query.postId = postId;
        }

        if(type === "COMMENT") {
            if(!commentId) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Không hợp lệ"
                });
            }

            if(commentId.length !== 24) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Không hợp lệ"
                });
            }

            query.commentId = commentId;
        }

        const comment = await CommentsModel.findOne(query);

        if (!comment.commentId) {
          return res.status(HttpStatus.BAD_REQUEST).json({
              message: "Không hợp lệ"
          });
        }

        if(!comment.postId) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không hợp lệ"
            });
        }

        const commentDb = new CommentsModel ({
            userId: req.user._id,
            postId: postId,
            text: content,
            parentCommentId: commentId
        });

        await commentDb.save();
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