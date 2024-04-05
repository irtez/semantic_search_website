const multer  = require('multer')
const path = require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsPath = path.join(__dirname, '..', 'uploads')
        cb(null, uploadsPath)
    },
    filename: function (req, file, cb) {
        cb(null, Buffer.from(file.originalname, 'latin1').toString('utf-8'))
    }
  })

module.exports = storage