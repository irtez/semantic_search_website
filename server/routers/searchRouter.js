const Router = require('express')
const router = new Router()
const controller = require('../controllers/searchController')

router.get('/text', controller.text)


module.exports = router