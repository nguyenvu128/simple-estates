const express = require('express');
const router = express.Router({});
const CommentsController = require('../controllers/comments.controller');
const checkToken = require('../middlewares/check-token.middleware');

router.post('/', checkToken, CommentsController.createComment);
router.get('/', checkToken, CommentsController.getListComments);

module.exports = router;