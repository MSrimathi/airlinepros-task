const compose = require('composable-middleware');

const checkRole = (role) => {
    return compose()
        .use(function (req, res, next) {
            if (req.user.role != role) {
                res.status(403).send('Access Denied');
                return;
            }
            next();
        })
}

module.exports = checkRole;