const Router = require('express')
const router = new Router()
const controller = require('../controllers/documentController')
const roleMiddleware = require('../middleware/roleMiddleware')
const multer  = require('multer')
const storage = require('./storage')
const upload = multer({ storage: storage })

router.post('', [upload.array("files"), roleMiddleware(['ADMIN'])], controller.add)
router.get('/:id', controller.getOne)
router.get('/download/:id', controller.downloadOne)
router.delete('/:id', roleMiddleware(['ADMIN']), controller.delete)
router.patch('/:id', roleMiddleware(['ADMIN']), controller.update)
router.post('/test', [upload.array("files"), roleMiddleware(['ADMIN'])], controller.test)

module.exports = router