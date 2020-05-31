const express = require('express');
const router = express.Router({});
const postsRouter = require('./posts.route');
const statisticRouter = require('./statistic.route');


router.use('/posts', postsRouter);
router.use('/statistic', statisticRouter);

module.exports = router;