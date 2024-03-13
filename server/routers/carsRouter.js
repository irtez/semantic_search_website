const Router = require('express')
const router = new Router()
const controller = require('../controllers/carsController')
const roleMiddleware = require('../middleware/roleMiddleware')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


router.post('/create', [upload.single("image"), roleMiddleware(['ADMIN'])], controller.create)
router.get('/getall', controller.getAll)
router.get('/:carid', controller.getOne)
router.delete('/:carid', roleMiddleware(['ADMIN']), controller.delete)
router.patch('/:carid', roleMiddleware(['ADMIN']), controller.update)

module.exports = router