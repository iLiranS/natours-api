const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();


router.route('/signup').post(authController.signup) // takes all data for creating a user and returns a token
router.route('/login').post(authController.login) // takes email+password and returns a token
router.route('/forgot-password').post(authController.forgotPassword) // sends email with temp token
router.route('/reset-password/:token').patch(authController.resetPassword) // takes pass+confirm and updating new password
router.route('/update-password').patch(authController.protect, authController.updatePassword) // takes header token, body: password+confirm and updates.
router.route('/updateMe').patch(authController.protect, userController.updateMe) // update user details (except for password)
router.route('/deleteMe').delete(authController.protect, userController.deleteMe)

router.route('/').get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers)
  .post(userController.createUser);
router.route('/:id').get(authController.protect, authController.restrictTo('admin'), userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
