const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    questionNumber: {
        type: Number,
        required: true,
        unique: true,
        dropDups: true
    },
    question: {
        type: String,
        required: true,
    },
    questionFlag: {
        type: String,
        required: true
    },
    questionHint: [{
        hintName: {
            type: String,
            required: true
        },
        hintText: {
            type: String,
            required: true
        }
    }],
    questionLink: [{
        linkName: {
            type: String,
            required: true
        },
        linkText: {
            type: String,
            required: true
        }
    }],
    weightage: {
        type: Number,
        required: true,
        default: 100
    }
});


const questionModel = mongoose.model('questions', questionSchema);
module.exports = questionModel;
