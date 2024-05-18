const {Schema, model} = require('mongoose')

const Collection = new Schema({
    user_id: {
        type: String,
        unique: false,
        required: true
    },
    name: {
        type: String,
        unique: false,
        required: true
    },
    documents: {
        type: Array,
        unique: false,
        required: false
    }
})

module.exports = model('Collection', Collection)