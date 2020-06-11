const express = require('express');
const router = express.Router({});
const usersController = require('../controllers/users.controller');

router.post('/login', usersController.userLogin);
router.post('/register', usersController.registerNewUser);
router.post('/confirm', usersController.confirmUser);
router.post('/forget', usersController.forgetPassword);
router.post('/reset', usersController.resetPassword);

module.exports = router;