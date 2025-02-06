const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', authController.logOut);

router.post('/forgotPassword', authController.forgotPassword);

router.route('/').get(userController.getUsersData);
router.route('/:id').get(userController.getUserData);

module.exports = router;
