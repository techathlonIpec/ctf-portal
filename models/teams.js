const mongoose = require('mongoose');

const schema = mongoose.Schema;

const teamSchema = new schema({
    teamName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    currentQuestion:{
        type: Number,
        default:1
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    hintsUsed:{
        type: Number,
        required: true,
        default: 0
    },
    lastAnsweredOn:{
        type:String,
        required: false,
    }
});

const participantModel = mongoose.model('teams', teamSchema);
module.exports = participantModel;

