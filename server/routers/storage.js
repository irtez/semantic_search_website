const multer  = require('multer')
const path = require('path')
const fs = require('fs')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsPath = path.join(__dirname, '..', 'uploads')
        cb(null, uploadsPath)
    },
    filename: function (req, file, cb) {
        let fileName = Buffer.from(file.originalname, 'latin1').toString('utf-8')

        const checkAndRename = (fileName, counter = 1) => {
            const filePath = path.join(__dirname, '..', 'uploads', fileName);
            fs.access(filePath, fs.constants.F_OK, (err) => {
              if (err) {
                cb(null, fileName);
              } else {
                const [baseName, ext] = fileName.split('.');
                const newFileName = `${baseName}-${counter}.${ext}`;
                checkAndRename(newFileName, counter + 1);
              }
            });
          };

        checkAndRename(fileName);
    }
  })

module.exports = storage