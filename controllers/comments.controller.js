const mongoose = require('mongoose');
const HttpStatus = require('http-status-codes');
const PostModel = require('../models/post.model');
const UsersModel = require('../models/users.model');
const CommentsModel = require('../models/comments.model');

const createComment = async (req, res) => {
    try {
        const {type, postId, commentId, content} = req.body;
        const query = {};
        if(type === 'POST') {
            query.postId = postId;
        }

        if(type === "COMMENT") {
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

        // const commentDb = new CommentsModel ({
        //     userId:
        // });

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