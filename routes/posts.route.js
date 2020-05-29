const express = require('express');
const router = express.Router({});
const controller = require('../controllers/posts.controller');

router.get('/', controller.getListPosts);
router.get('/:slug', controller.getDetailPost);

module.exports = router;