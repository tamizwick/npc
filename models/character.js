const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const characterSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: String,
    pronunciation: String,
    race: [String],
    gender: String,
    alignment: String,
    appearance: String,
    knownAssociates: [{
        type: Schema.Types.ObjectId,
        ref: 'Character'
    }],
    locations: [String],
    factions: [String],
    characteristics: [String],
    biography: String,
    notableInteractions: [String],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Character', characterSchema);