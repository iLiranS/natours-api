const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const extractToken = require('../utils/extractToken');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // <<expires in>> days
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOption.secure = true // for testig no need for https
    res.cookie('jwt', token, cookieOption)
    user.password = undefined // hide password (it's hashed anyways but still)

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        photo: req.body.photo,
        passwordConfirm: req.body.passwordConfirm
        // role:'user' // so there is no way to create user an admin, only admins can set up admins!
    });
    createSendToken(newUser, 200, res);
})
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('no email or password provided', 400)
    // we removed passwrod from selecting so we need to explicitly select it now
    const user = await User.findOne({ email }).select('+password');
    // check passwords hashing match and if user exists
    if (!user || !await user.correctPassword(password, user.password)) throw new AppError('Email or Password are incorrect', 401);
    // valid user, get token and return success responsez
    createSendToken(user, 200, res);

})
// middleware for protected routes (sensitive user related)
exports.protect = catchAsync(async (req, res, next) => {
    // get the token and check if exists
    const decoded = await extractToken(req);
    // check if user still exists (token might be valid bu no such a user exists)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) throw new AppError('User does not exists with this token!', 401);

    // check if user changed password after token was issued (in case of password reset for protection - so decline access)
    if (currentUser.changedPasswordAfter(decoded.iat)) throw new AppError('Please login again after password change', 401);

    // valid , grant access
    req.user = currentUser;
    next();
})
// make sure to call 'protect' first to make sure that the user is signed in with valid token and req.user exists now
exports.restrictTo = (...roles) => catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new AppError('Not Authorized for this action !', 403);
    // rule matches , access granted
    next();
})

/**
 * sends password reset to email, sets passwordResetToken and passwordResetExpires to user file.
 * @param req - include email in body
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on email
    const user = await User.findOne({ email: req.body.email })
    if (!user) throw new Error("no user with this email exists!", 404)

    // 2) generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) send it to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`
    const message = `Forgot your password ? Submit PATCH req with your new password and passwordConfirm
         to ${resetURL}\n If you didn't request this message, you can simply ignore it!`
    const options = {
        email: user.email,
        message,
        subject: "Password Reset Request - Natours (Valid for 10 minutes)"
    }
    // in case of error of sending email we need to repeat process.
    try {
        await sendEmail(options)
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false }); // reset token properties
        throw new AppError("Something went wrong with sending reset email !", 500);
    }


    res.status(200).json({
        status: 'success',
        message: "Please check your email for reset steps!"
    })
})
// 
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) throw new AppError('token is invalid or expired', 400)

    // 2) set new password and update based on req if token is valid
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 3) login the user
    createSendToken(user, 200, res)

})
// requires going through protect middleware, body : passwrod,newPassword,newPasswordConfirm
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) get user from token and check if password matches
    const currentUser = await User.findById(req.user.id).select('+password');
    // 2) chekc if user exists and password matching
    if (!await currentUser.correctPassword(req.body.oldPassword, currentUser.password)) throw new AppError('old password is incorrect', 401);
    // 3) update password after checks (the model validators will handle if passsword/confirm are valid)
    currentUser.password = req.body.password
    currentUser.passwordConfirm = req.body.passwordConfirm
    await currentUser.save()
    // 4) Log the user in , (send JWT)
    createSendToken(currentUser, 200, res);

})