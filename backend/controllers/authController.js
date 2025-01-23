const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../libs/winston');
const crypto = require('crypto');

const AuthController = {
    postRegister : async (req, res) => {
        const { name, email, password } = req.body;
        
        try {

            if(await User.findOne({ email })) {
                return res.status(400).send({ status: false, message: 'email already exists.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = new User({ name, email, password: hashedPassword });
            await user.save();

            return res.status(201).send({ status: true, message: 'registered successfully.' });
            
        } catch (e) {
            logger.error(e.toString());
            res.status(500).send({ status: false, message: 'internal server error.' });
        }
    },

    postLogin : async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({email});
            if(!user || !await bcrypt.compare(password, user.password)) {
                return res.status(400).send({ status: false, message: 'invalid credentials.' });
            }

            const payload = {
                id: user._id,
                name: user.name,
                email: user.email
            };

            const roomId = crypto.createHash('sha256').update(user._id.toString()).digest('hex');
            const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

            res.status(200).send({
                status: true,
                message: 'login successful.',
                roomId: roomId,
                accessToken: accessToken,
                refreshToken: refreshToken
            });

        } catch (e) {
            logger.error(e.toString());
            res.status(500).send({ status: false, message: 'internal server error.' });
        }
    },

    getRefreshToken : async (req, res) => {
        const authHeader = req.headers['authorization'];
        const refreshToken = authHeader && authHeader.split(' ')[1];

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
            const newAccessToken = jwt.sign(
                { id: decoded.id, name: decoded.name, email: decoded.email },
                process.env.JWT_ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            return res.status(200).send({ status: true, accessToken: newAccessToken });
        } catch (e) {
            logger.error(e.toString());
            return res.status(403).json({ status: true, message: 'Invalid refresh token' });
        }
    },
    
}

module.exports = AuthController;