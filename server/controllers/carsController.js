const Car = require('../models/Car')
const imgUploader = require("imgbb-uploader")


class carsController {
    async create(req, res) {
        try {
            const name = req.body.name
            const candidate = await Car.findOne({name})
            if (candidate) {
                return res.status(400).json({message: "Автомобиль с таким названием уже существует"})
            }
            const response = await imgUploader(process.env.imgKey, req.file.path)
            const imgURL = response.url
            try {
                const car = new Car({
                    name,
                    body: req.body.body,
                    year: req.body.year,
                    engine: req.body.engine,
                    transmission: req.body.transmission,
                    mileage: req.body.mileage,
                    img: imgURL,
                    brand: req.body.brand,
                    configuration: req.body.configuration,
                    price: req.body.price,
                    color: req.body.color
                })
                car.save()
                res.status(200).json(car)
            } catch (e) {
                console.log(e)
                return res.status(400).json({message: "Ошибка записи в бд"})
            }
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Create car error"})
        }
    }

    async delete(req, res) {
        try {
            const carid = req.params.carid
            const car = await Car.findById(carid)
            if (!car) {
                return res.status(400).json({message: "Машина не найдена"})
            }
            const delCar = await car.deleteOne()
            return res.status(200).json(car)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Get all cars error'})
        }
    }

    async update(req, res) {
        try {
            const carid = req.params.carid
            const price = req.body.price
            if (!price) {
                return res.status(400).json({message: "Не задана цена"})
            }
            const car = await Car.findById(carid)
            if (!car) {
                return res.status(400).json({message: "Машина не найдена"})
            }
            const newCar = await car.updateOne({price: price})
            return res.status(200).json(newCar)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Get all cars error'})
        }
    }

    async getAll(req, res) {
        try {
            const cars = await Car.find()
            return res.status(200).json(cars)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Get all cars error'})
        }
    }

    async getOne(req, res) {
        try {
            const carid = req.params.carid
            const car = await Car.findById(carid)
            return res.status(200).json(car)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Get one car error'})
        }
    }

}

module.exports = new carsController()