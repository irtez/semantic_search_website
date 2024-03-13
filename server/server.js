const express = require('express')
require('dotenv').config()
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose')
const app = express()
const router = require('./routers/index')
const cors = require('cors')

app.use(cors())
app.options('*', cors())
app.use(express.json())
app.use("/", router)



const start = async () => {
    try {
        await mongoose.connect(process.env.dbKey)
        app.listen(PORT, () => {
            console.log(`server is listening port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()