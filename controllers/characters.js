const { validationResult } = require('express-validator');

const Character = require('../models/character');
const User = require('../models/user');

exports.getCharacters = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Unable to fetch character.');
            error.statusCode = 422;
            error.data = errors;
            throw error;
        }
        let characters;
        if (req.query.ids) {
            ids = req.query.ids.split(',');
            characters = await Character.find()
                .where('_id').in(ids)
                .exec();
        } else {
            characters = await Character.find({ user: req.userId });
        }
        if (!characters.length) {
            const error = new Error('No characters found.');
            error.statusCode = 404;
            throw error;
        }
        const updatedChars = characters.map((char) => {
            return {
                ...char._doc,
                _id: char._id.toString()
            };
        });
        res.status(200).json({
            message: 'Characters fetched.',
            characters: updatedChars
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postNewCharacter = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Unable to create character.');
            error.statusCode = 422;
            error.data = errors;
            throw error;
        }
        const character = new Character({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            pronunciation: req.body.pronunciation,
            race: req.body.race ? [...req.body.race] : [],
            gender: req.body.gender,
            alignment: req.body.alignment,
            appearance: req.body.appearance,
            knownAssociates: req.body.knownAssociates ? [...req.body.knownAssociates] : [],
            locations: req.body.locations ? [...req.body.locations] : [],
            factions: req.body.factions ? [...req.body.factions] : [],
            characteristics: req.body.characteristics ? [...req.body.characteristics] : [],
            biography: req.body.biography,
            notableInteractions: req.body.notableInteractions ? [...req.body.notableInteractions] : [],
            campaigns: req.body.campaigns ? [...req.body.campaigns] : [],
            user: req.userId
        });
        const char = await character.save();
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        user.characters.push(character);

        //Update options
        updateCharOptions(user, char);

        await user.save();

        res.status(200).json({ message: `${character.firstName} created.` });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.putUpdateCharacter = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Unable to update character.');
            error.statusCode = 422;
            error.data = errors;
            throw error;
        }
        const charId = req.params.charId;
        const character = await Character.findById(charId);
        if (!character) {
            const error = new Error('Character not found.');
            error.statusCode = 404;
            throw error;
        }
        for (property in req.body) {
            if (Array.isArray(req.body[property])) {
                character[property] = [...req.body[property]];
            } else {
                character[property] = req.body[property];
            }
        }
        await character.save();
        res.status(200).json({ message: `${character.firstName} updated.` });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteCharacter = async (req, res, next) => {
    try {
        const charId = req.params.charId;
        const character = await Character.findById(charId);
        if (!character) {
            const error = new Error('Character not found.');
            err.statusCode = 404;
            throw error;
        }
        const userId = character.user.toString();
        await Character.findByIdAndRemove(charId);
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found.');
            err.statusCode = 404;
            throw error;
        }
        user.characters.pull(charId);
        await user.save();
        res.status(200).json({ message: `${character.firstName} deleted.` });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getOptions = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: 'Options fetched.',
            options: user.options
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const updateCharOptions = (user, char) => {
    const fieldsWithOptions = ['race', 'gender', 'alignment', 'knownAssociates', 'locations', 'factions', 'campaigns'];
    for (const field of fieldsWithOptions) {
        const prevOptions = user.options[field];
        const isArray = Array.isArray(char[field]);
        if (isArray) {
            char[field].forEach((option) => {
                if (!prevOptions.includes(option)) {
                    prevOptions.push(option);
                }
            });
        } else {
            if (!prevOptions.includes(char[field])) {
                prevOptions.push(char[field]);
            }
        }
        user.options[field] = prevOptions;
    }
};