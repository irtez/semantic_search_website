const {Schema, model} = require('mongoose')

const Document = new Schema({
    gost_number: {
        type: String,
        unique: false,
        required: true
    },
    filename: {
        type: String,
        unique: false,
        required: false
    },
    title: {
        type: String,
        unique: false,
        required: true
    },
    status: {
        type: String,
        unique: false,
        required: false
    },
    date_start: {
        type: String,
        unique: false,
        required: false
    },
    date_cancel: {
        type: String,
        unique: false,
        required: false
    },
    replaced_by: {
        type: String,
        unique: false,
        required: false
    },
    main_section: {
        type: String,
        unique: false,
        required: false
    },
    subsection: {
        type: String,
        unique: false,
        required: false
    },
    OKS: {
        type: String,
        unique: false,
        required: false
    },
    file_url: {
        type: String,
        unique: false,
        required: false
    },
    date_cancel: {
        type: String,
        unique: false,
        required: false
    },
    text_plain: {
        type: String,
        unique: false,
        required: false
    },
    text_markdown: {
        type: String,
        unique: false,
        required: false
    }
})

module.exports = model('Document', Document)