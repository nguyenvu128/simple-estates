const express = require('express');
const router = express.Router({});
const CommentController = require('/controllers/comments.controller');

router.post('/comments', CommentController.createComment);

module.exports = router;