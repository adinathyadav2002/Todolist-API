const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

router.route('/').get(userController.getUsersData);
router.route('/:id').get(userController.getUserData);

module.exports = router;
