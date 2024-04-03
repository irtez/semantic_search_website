const {Schema, model} = require('mongoose')

const History = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    img: {
        type: String,
        unique: false,
        required: true
    }
})

module.exports = model('History', History)