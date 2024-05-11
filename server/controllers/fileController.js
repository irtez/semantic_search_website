const Document = require('../models/Document')
const fs = require('fs').promises
const pdf2html = require('pdf2html')
const path = require('path')



async function importPdfReader() {
    const { PdfReader } = await import('pdfreader');
    return new PdfReader();
}

async function getText(filename, reader) {
    let fileText = ''
    if (filename.endsWith('.pdf')) {
        await new Promise((resolve, reject) => {
            reader.parseFileItems(filename, (err, item) => {
            if (err) {
                reject(err)
            } else if (!item) {
                resolve()
            } else if (item.text) {
                fileText += (item.text + '\n')
            }
            })
        })
    }
    else if (filename.endsWith('.txt')) {
        fileText = await fs.readFile(filename, 'utf8')
    }
    if (!fileText.length) {
        fileText = 'empty'
    }
    return fileText
}


class fileController {
    async add(req, res) {
        try {
            const comment = req.body.comment
            const files = Array.from(req.files)
            const statuses = JSON.parse(req.body.statuses)
            // добавить обработку исключений по типу существующей записи/не unique ключа
            const reader = await importPdfReader()            

            files.forEach(async (file, index) => {
                try {
                    const fileText = await getText(file.path, reader)
                    const document = new Document(
                        {
                            name: file.filename.slice(0, -4),
                            text: fileText,
                            idPoint: index*2,
                            status: statuses[index] || 'present',
                            path: file.path
                        }
                    )
                    await document.save()
                    
                } catch (e) {
                    console.log(e)
                    return res.status(400).json({message: "Ошибка записи в бд"})
                }
            })
            
            // files.forEach((file) => {
            //     console.log(file.name)
            //     console.log(file.path)
            // })
            
            return res.status(200).json({message: "OK"})

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Ошибка при добавлении документа"})
        }
    }


    async getOne(req, res) {
        try {
            const docId = req.params.docId
            let doc = await Document.findById(docId)
            if (!doc) {
                return res.status(500).json({message: 'Запрашиваемый файл не найден'})
            }
            // doc = doc.toObject()
            // let docMarkup = ''
            // if (doc.path.endsWith('.pdf')) {
            //     const pages = await pdf2html.pages(doc.path)
            //     pages.forEach((page) => { docMarkup += page })
            // }
            // else if (doc.path.endsWith('.txt')) {
            //     docMarkup = doc.text
            // }
            // doc.markup = docMarkup
            return res.status(200).json(doc)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка загрузки документа'})
        }
    }

    async downloadOne(req, res) {
        try {
            const docId = req.params.docId
            const doc = await Document.findById(docId)
            if (!doc) {
                return res.status(500).json({message: 'Запрашиваемый файл не найден'})
            }
            // res.setHeader('Content-Type', 'application/octet-stream')
            // res.setHeader('Content-Disposition', `attachment; filename="${doc.name}.ext"`)
            res.sendFile(path.join(__dirname, '..', 'uploads/' + doc.filename))

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка при загрузке файла'})
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

module.exports = new fileController()