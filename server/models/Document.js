const {Schema, model} = require('mongoose')

const Document = new Schema({
    docName: {
        type: String,
        unique: true,
        required: true
    },
    docText: {
        type: String,
        unique: false,
        required: true
    },
    idPoint: {
        type: Number,
        unique: true,
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