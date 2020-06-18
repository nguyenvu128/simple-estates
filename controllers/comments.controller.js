const mongoose = require('mongoose');
const HttpStatus = require('http-status-codes');
const CommentsModel = require('../models/comments.model');
const PostsModel = require('../models/post.model');
const PostController = require('./posts.controller');
const UserModel = require('../models/users.model');

const isValidType = (mongoIdStr, res) => {

    if (!mongoIdStr) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Không hợp lệ"
        });

        return false;
    }

    if (mongoIdStr.length !== 24) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Không hợp lệ"
        });

        return false;
    }

    return true;
};

const extractPromiseAllComments = (comments) => {
    return Promise.all(comments.map(async (cmt) => {
        const user = await UserModel.findOne({_id: cmt.userId});
        if (!user) {
            return {
                content: cmt.text,
                updatedAt: cmt.updatedAt,
                email: "Vô danh"
            }
        }
        return {
            content: cmt.text,
            updatedAt: cmt.updatedAt,
            email: user.email
        }

    }))
};

const createComment = async (req, res) => {
    try {
        const {type, postId, commentId, content} = req.body;
        let commentData = {};
        if (type !== "POST" && type !== "COMMENT") {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không hợp lệ "
            });
        }

        if (!content) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Không hợp lệ"
            });
        }

        if (type === "POST") {
            const isValidatorPostId = isValidType(postId, res);
            if (isValidatorPostId === false) {
                return;
            }

            const post = await PostsModel.findOne({_id: postId});

            if (!post) {
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

        if (type === "COMMENT") {
            const isValidatorCommentId = isValidType(commentId, res);
            if (isValidatorCommentId === false) {
                return;
            }

            const comment = await CommentsModel.findOne({_id: commentId});


            if (!comment) {
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

        const commentModel = new CommentsModel(commentData);
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

const getListComments = async (req, res) => {
    try {
        let {type, commentId, postId} = req.query;
        let listComments = [];
        let queryId = {};
        if (type !== "POST" && type !== "COMMENT") {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: "Yêu cầu không hợp lệ"
            });
        }

        const pagination = PostController.extractPagination(req.query, res);
        if (pagination === false) {
            return;
        }

        if (type === "POST") {
            const isValidatorPostId = isValidType(postId, res);
            if (isValidatorPostId === false) {
                return;
            }
            queryId.postId = postId;
        }

        if (type === "COMMENT") {
            const isValidatorPostId = isValidType(commentId, res);
            if (isValidatorPostId === false) {
                return;
            }
            queryId.parentCommentId = commentId;
        }

        const comments = await CommentsModel.find(queryId)
            .skip(pagination.page * pagination.limit)
            .sort({updatedAt: -1})
            .limit(pagination.limit);

        await extractPromiseAllComments(comments).then(res => listComments = res);

        return res.status(HttpStatus.OK).json({
            message: "Thành công",
            comments: listComments
        });
    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        });
    }
};

module.exports = {
    createComment,
    getListComments
};