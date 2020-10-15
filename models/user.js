const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    characters: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    classifications: [{
        name: String,
        options: []
    }]
});

module.exports = mongoose.model('User', userSchema);