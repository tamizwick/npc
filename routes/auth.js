const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.post(
    '/signup',
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then((userDoc) => {
                    if (userDoc) {
                        const error = new Error('User already exists.');
                        error.statusCode = 409;
                        throw error;
                    }
                });
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 6 }),
    body('userName')
        .trim()
        .not()
        .isEmpty(),
    authController.signup);

router.post('/signin', authController.signin);

module.exports = router;