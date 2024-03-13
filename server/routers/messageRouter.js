const Router = require('express')
const router = new Router()
const controller = require('../controllers/messageController')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/create', controller.create)
router.get('/getalluser/:status', roleMiddleware(['USER', 'ADMIN']), controller.getAllUser)
router.get('/getalladmin/:status', roleMiddleware(['ADMIN']), controller.getAllAdmin)
router.patch('/:id', roleMiddleware(['ADMIN']), controller.changeStatus)

module.exports = router