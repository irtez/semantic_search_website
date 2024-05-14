const express = require('express')
const auth = require('./authRouter')
const car = require('./carsRouter')
const file = require('./fileRouter')
const collection = require('./collectionRouter')
const health = require('../controllers/healthCheck')
const search = require('./searchRouter')

const router = new express.Router()
router.use('/auth', auth)
router.use('/file', file)
router.use('/collection', collection)
router.use('/search', search)
router.get('/health', health.healthCheck)


module.exports = router