const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        // required: true,
        unique: true
    },
    password: {
        type: String,
        // required: true,
    },


    otp: { type: String }, // OTP for verification
    otpExpiry: { type: Date }, // Expiry time for OTP
    isVerified: { type: Boolean, default: false }, // Email verification status
    picture: String,
    provider: String


});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;