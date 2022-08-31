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
    role: {
        type: String,
        enum: ['SUPER_USER', 'EMPLOYEE']
    }
})

const User = mongoose.model("User", UserSchema);

module.exports = User;