const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowerCase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    date_of_join: {
        type: Date
    },
    role: {
        type: String,
        enum: ['SUPER_USER', 'EMPLOYEE'],
        default: 'EMPLOYEE'
    }
})

const User = mongoose.model("User", UserSchema);

module.exports = User;