const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error('Unable to create user.');
            error.statusCode = 422;
            error.data = errors;
            throw error;
        }
        const email = req.body.email;
        const password = req.body.password;
        const userName = req.body.userName;
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            userName: userName,
            campaigns: [],
            characters: []
        });
        await user.save();
        res.status(201).json({
            message: 'User created.'
        })
    } catch (err) {
        if (!err.statusCode) {
            statusCode = 500;
        }
        next(err);
    }
};

exports.signin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Incorrect password.');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            'b1vMcPpevNGi5aHkcROa',
            { expiresIn: '1d' }
        );
        res.status(200).json({
            token: token,
            userId: user._id.toString()
        });
    } catch (err) {
        if (!err.statusCode) {
            statusCode = 500;
        }
        next(err);
    }
};