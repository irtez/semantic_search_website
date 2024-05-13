const Router = require('express')
const router = new Router()
const controller = require('../controllers/fileController')
const roleMiddleware = require('../middleware/roleMiddleware')
const multer  = require('multer')
const storage = require('./storage')
const upload = multer({ storage: storage })

router.post('/add', [upload.array("files"), roleMiddleware(['ADMIN'])], controller.add)
//router.post('/create', [upload.single("image"), roleMiddleware(['ADMIN'])], controller.create)
router.get('/:docId', controller.getOne)
router.get('/download/:docId', controller.downloadOne)
// router.delete('/:brandName', roleMiddleware(['ADMIN']), controller.delBrand)
// router.patch('/:brandName', [upload.single("image"), roleMiddleware(['ADMIN'])], controller.update)

module.exports = router