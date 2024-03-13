const Brand = require('../models/Brand')
const imgUploader = require("imgbb-uploader");


class brandController {
    async create(req, res) {
        try {
            const brandName = req.body.name
            const candidate = await Brand.findOne({name: brandName})
            if (candidate) {
                return res.status(400).json({message: "Бренд с таким названием уже существует"})
            }
            const response = await imgUploader(process.env.imgKey, req.file.path)
            if (!response) {
                return res.status(400).json({message: "Ошибка загрузки изображения на сервер"})
            }
            const imgURL = response.url
            try {
                const brand = new Brand({name: brandName, img: imgURL})
                brand.save()
                res.status(200).json(brand)
            } catch (e) {
                console.log(e)
                return res.status(400).json({message: "Ошибка записи в бд"})
            }
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Create brand error"})
        }
    }

    async update(req, res) {
        try {
            const brandName = req.params.brandName
            const brand = await Brand.findOne({name: brandName})
            if (!brand) {
                return res.status(400).json({message: "Бренд с таким названием нет"})
            }
            const response = await imgUploader(process.env.imgKey, req.file.path)
            if (!response) {
                return res.status(400).json({message: "Ошибка загрузки изображения на сервер"})
            }
            const imgURL = response.url
            const newBrand = await brand.updateOne({img: imgURL})
            if (!newBrand) {
                return res.status(400).json({message: "Ошибка записи в БД"})
            }
            return res.status(200).json(newBrand)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Edit brand error'})
        }
    }

    async delBrand(req, res) {
        try {
            const brand = req.params.brandName
            const deleted = await Brand.findOneAndDelete({name: brand})
            return res.status(200).json(deleted)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Delete brand error'})
        }
    }

    async getAll(req, res) {
        try {
            const brands = await Brand.find()
            return res.status(200).json(brands)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Get brands error'})
        }
    }
}

module.exports = new brandController()