const express = require('express');
const router = express.Router({});
const postsRouter = require('./posts.route');
const statisticRouter = require('./statistic.route');
const authUserRouter = require('./auth-users.route');


router.use('/posts', postsRouter);
router.use('/statistic', statisticRouter);
router.use('/auth', authUserRouter);

module.exports = router;