const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();


router.route('/signup').post(authController.signup) // takes all data for creating a user and returns a token
router.route('/login').post(authController.login) // takes email+password and returns a token
router.route('/forgot-password').post(authController.forgotPassword) // sends email with temp token
router.route('/reset-password/:token').patch(authController.resetPassword) // takes pass+confirm and updating new password

// Protect all routes after this middleware (login required)
router.use(authController.protect)

router.route('/update-password').patch(authController.updatePassword) // takes header token, body: password+confirm and updates.
router.route('/me').get(userController.getMe)
router.route('/updateMe').patch(userController.updateMe) // update user details (except for password)
router.route('/deleteMe').delete(userController.deleteMe)

// Admin restriction after this middleware
router.use(authController.restrictTo('admin'))

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
