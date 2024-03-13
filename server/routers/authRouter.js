const Router = require('express')
const router = new Router()
const controller = require('../controllers/authController')
const {check} = require('express-validator')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/register', [
    check('email', 'Электронная почта не может быть пустой').notEmpty(),
    check('name', 'ФИО не может быть пустым').notEmpty(),
    check('phone', 'Номер телефона не может быть пустым').notEmpty(),
    check('password', 'Пароль должен быть больше 4 символов и не более 15').isLength({min: 4, max: 15})
], controller.registration)
router.post('/login', controller.login)
router.get('/check', controller.check)
router.get('/users', roleMiddleware(['USER', 'ADMIN']), controller.getUsers)
router.get('/getme', controller.getMe)
router.patch('/updateuser', controller.updateUser)

module.exports = router