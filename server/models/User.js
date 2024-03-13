const {Schema, model} = require('mongoose')

const User = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        unique: false,
        required: true
    },
    phone: {
        type: String,
        unique: false,
        required: true
    },
    password: {
        type: String,
        unique: false,
        required: true
    },
    roles: [{type: String, ref: 'Role'}]
})

module.exports = model('User', User)