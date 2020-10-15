const express = require('express');
const { body, query } = require('express-validator');
const mongoose = require('mongoose');
const characterController = require('../controllers/characters');

const router = express.Router();

router.get('/',
    query('ids')
        .custom((value, { req }) => {
            let ids;
            if (req.query.ids) {
                ids = value.split(',');
                ids.forEach((id) => {
                    if (!mongoose.Types.ObjectId.isValid(id)) {
                        const error = new Error('Invalid character ID.');
                        error.statusCode = 400;
                        throw error;
                    }
                });
            }
            return true;
        }),
    characterController.getCharacters
);

router.post('/new',
    body('firstName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Character must have a name.'),
    characterController.postNewCharacter
);

router.put('/update/:charId',
    body('firstName')
        .trim()
        .not()
        .isEmpty(),
    characterController.putUpdateCharacter
);

router.delete('/delete/:charId', characterController.deleteCharacter);

module.exports = router;