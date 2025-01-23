const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({status:false, message:'Unauthorized'});
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {

        if(err) {
            return res.status(401).send({status:false, message:'Unauthorized'});
        }

        req.user = user;
        next();
    });

};

module.exports = authMiddleware;