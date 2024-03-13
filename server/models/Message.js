const {Schema, model} = require('mongoose')

const Message = new Schema({
    useremail: {
        type: String,
        unique: false,
        required: true
    },
    userphone: {
        type: String,
        unique: false,
        required: true
    },
    username: {
        type: String,
        unique: false,
        required: true
    },
    title: {
        type: String,
        unique: false,
        required: true
    },
    text: {
        type: String,
        unique: false,
        required: true
    },
    status: {
        type: String,
        unique: false,
        required: true
    },
    timestamp: {
        type: String,
        unique: false,
        required: true
    }
})

module.exports = model('Message', Message)