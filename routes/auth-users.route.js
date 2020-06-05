const express = require('express');
const router = express.Router({});
const usersController = require('../controllers/users.controller');

router.post('/login', usersController.getUserLogin);
router.post('/register', usersController.getUserRegister);

module.exports = router;