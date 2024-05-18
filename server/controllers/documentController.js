const Document = require('../models/Document')
const Collection = require('../models/Collection')
const fs = require('fs').promises
const pdf2html = require('pdf2html')
const path = require('path')

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

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
            return res.status(501).json({message: "Not implemented yet"})
            const comment = req.body.comment
            const documents = Array.from(req.files)
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
            const docId = req.params.id
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
            const docId = req.params.id
            const doc = await Document.findById(docId)
            if (!doc) {
                return res.status(404).json({message: 'Запрашиваемый файл не найден'})
            }
            // res.setHeader('Content-Type', 'application/octet-stream')
            // res.setHeader('Content-Disposition', `attachment; filename="${doc.name}.ext"`)
            if (!doc.filename) {
                return res.status(400).json({message: 'Файл с запрашиваемым документом отсутствует'})
            }
            res.sendFile(path.join(__dirname, '..', 'uploads/' + doc.filename))

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка при загрузке файла'})
        }
    }

    async update(req, res) {
        try {
            const docId = req.params.id
            const newData = req.body
            const document = await Document.findById(docId)
            if (!document) {
                return res.status(404).json({message: "Документ не найден"})
            }
            Object.assign(document, newData)
            await document.save()
            sleep(500)
            return res.status(200).json({document})

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Ошибка обновления документа'})
        }
    }

    async delete(req, res) {
        try {
            const docId = req.params.id
            const deleted = await Document.findByIdAndDelete(docId)
            const filter = { documents: docId }
            const update = { $pull: { documents: docId } }
            const result = await Collection.updateMany(filter, update)

            sleep(500)
            return res.status(200).json(deleted)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Delete brand error'})
        }
    }

    // async getAll(req, res) {
    //     try {
    //         const brands = await Brand.find()
    //         return res.status(200).json(brands)
    //     } catch (e) {
    //         console.log(e)
    //         return res.status(400).json({message: 'Get brands error'})
    //     }
    // }
}

module.exports = new fileController()