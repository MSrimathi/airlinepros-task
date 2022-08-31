const jwt = require("jsonwebtoken");
const User = require('../model/user');

const auth = async function (req, res, next) {
    try {
        var token = req.header('Authorization').replace('Bearer ', '');
        console.log('token', token);
        var decode = await jwt.verify(token, process.env.SECRET_KEY);

        var user = await User.findById(decode._id);

        if (!user) {
            res.status(400).send('Unauthenticated');
            return;
        }
        req.user = user;
        next();
        //    console.log('decode',decode._id);
        //    console.log("Token", token);
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal Server error');
    }

    // console.log('from auth function');
    // next();
}

module.exports = auth;