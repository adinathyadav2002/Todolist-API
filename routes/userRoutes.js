const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', authController.logOut);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
  .route('/')
  .get(authController.protect, userController.getUsersData)
  .post(authController.protect, userController.addTask);
router.route('/:id').get(userController.getUserData);

module.exports = router;
