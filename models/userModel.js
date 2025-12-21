const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
// create a schema with 5 fields :  name , email , photo (string) , password , passwordConfirm
const userSchema = new mongoose.Schema(

    {
        name: {
            type: String,
            required: [true, 'User must have a name']
        },
        email: {
            type: String, // verify it is an email later
            required: [true, 'a User must have an email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'please provide a valid email address']
        },

        photo: String,
        role: {
            type: String,
            enum: ['user', 'guide', 'lead-guide', 'admin'],
            default: 'user'
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: true,
            validate: {
                validator: function (val) {
                    return val === this.password
                },
                message: 'password confirmation must match entered password'
            }
        },
        passwordChangeAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        },
    }
)

// query middleware
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})

// don't keep confirmPassword field and store hashed password instead of plaintext
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.passwordConfirm = undefined;
    this.password = await bcrypt.hash(this.password, 12);
    // set changedAt if password changed with margin so new token would still work 
    if (!this.isNew) this.passwordChangeAt = Date.now() - 1000

    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPasswords) {
    // we can't use this.password because it is not selected
    return await bcrypt.compare(candidatePassword, userPasswords);
}
// return true if token is older than password update so invalid token
userSchema.methods.changedPasswordAfter = function (JWWTimestamp) {
    if (this.passwordChangeAt) {
        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000);
        return JWWTimestamp < changedTimestamp;
    }
    return false;
}
// generate reset token and hash it 
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
    return resetToken
}

const User = mongoose.model('User', userSchema);
module.exports = User;