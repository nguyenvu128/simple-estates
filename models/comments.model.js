const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const commentSchema = new Schema ({
    userId: ObjectId,
    postId: ObjectId,
    text: String,
    parentCommentId: ObjectId
}, {timestamps: true});

const Comment = new mongoose.model('Comment', commentSchema);
module.exports = Comment;