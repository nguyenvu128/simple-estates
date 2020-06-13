const express = require('express');
const router = express.Router({});
const CommentsController = require('../controllers/comments.controller');

router.post('/', CommentsController.createComment);

module.exports = router;