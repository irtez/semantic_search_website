const {Schema, model} = require('mongoose')

const Document = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    text: {
        type: String,
        unique: false,
        required: true
    },
    idPoint: {
        type: Number,
        unique: false,
        required: true
    },
    status: {
        type: String,
        unique: false,
        required: true
    },
    path: {
        type: String,
        unique: false,
        required: false
    }
})

module.exports = model('Document', Document)