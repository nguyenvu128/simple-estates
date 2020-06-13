const express = require('express');
const router = express.Router({});
const postsRouter = require('./posts.route');
const statisticRouter = require('./statistic.route');
const authUserRouter = require('./auth-users.route');
const commentsRouter = require('./comments.route');

router.use('/posts', postsRouter);
router.use('/statistic', statisticRouter);
router.use('/auth', authUserRouter);
router.use('/comments', commentsRouter);

module.exports = router;