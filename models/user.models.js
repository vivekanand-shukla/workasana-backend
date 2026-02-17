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
    picture: String,
    provider: String
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;