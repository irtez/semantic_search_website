const {Schema, model} = require('mongoose')


const Car = new Schema({
    name: {
        type: String,
        unique: false,
        required: true
    },
    color: {
        type: String,
        unique: false,
        required: true
    },
    configuration: {
        type: String,
        unique: false,
        required: true
    },
    year: {
        type: String,
        unique: false,
        required: true
    },
    engine: {
        type: String,
        unique: false,
        required: true
    },
    body: {
        type: String,
        unique: false,
        required: true
    },
    transmission: {
        type: String,
        unique: false,
        required: true
    },
    mileage: {
        type: String,
        unique: false,
        default: "0"
    },
    img: {
        type: String,
        unique: false,
    },
    brand: {
        type: String, 
        ref: 'Brand'
    },
    price: {
        type: String,
        unique: false,
        required: true
    }
})

module.exports = model('Car', Car)