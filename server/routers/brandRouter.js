const Router = require('express')
const router = new Router()
const controller = require('../controllers/brandController')
const roleMiddleware = require('../middleware/roleMiddleware')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/create', [upload.single("image"), roleMiddleware(['ADMIN'])], controller.create)
router.get('/getall', controller.getAll)
router.delete('/:brandName', roleMiddleware(['ADMIN']), controller.delBrand)
router.patch('/:brandName', [upload.single("image"), roleMiddleware(['ADMIN'])], controller.update)

module.exports = router