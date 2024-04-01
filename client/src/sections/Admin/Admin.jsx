import React, { useState, useEffect, useRef } from 'react';
import classes from './Admin.module.css'
import './Admin.css'


const Admin = () => {
    //brand
    const [chosenFiles, setFiles] = useState([])
    const fileInput = useRef(null)
    const [invalidFmtWarning, setInvalidFmtWarning] = useState(false)

    const handleBrandSubmit = async (event) => {
        try {
            event.preventDefault()
            
            console.log(chosenFiles)
            // const brandName = event.target.brandname.value.trim()
            // const formData = new FormData()
            // formData.append('image', selectedBrandImage)
            // formData.append('name', brandName)
            // const response = await createBrand(formData)
            // setnewBrand({name: response.name, imgurl: response.img})
            // event.target.brandname.value = ""
            // event.target.brandimg.value = ""
            // setselectedBrandImage(null)
        } catch (error) {
            console.error("Error processing files:", error)
        }
    }

    const handlePickFiles = (event) => {
        const newFiles = Array.from(event.target.files).filter((file) => file.name.includes('.pdf'))
        if (newFiles.length !== event.target.files.length) {
            setInvalidFmtWarning(true)
        }
        else {
            setInvalidFmtWarning(false)
        }
        setFiles(chosenFiles.concat(newFiles))
    }

    const handleFileDelete = (event) => {
        const indexToRemove = Number(event.target.dataset.value)
        const newFiles = chosenFiles.slice().filter((_, index) => index !== indexToRemove)
        setFiles(newFiles)  
        if (newFiles.length === 0) {
            fileInput.current.value = null
        }
        
      }


    const getPrettifiedSize = (size) => {
        return Math.round(size / 1024**2 * 100) / 100 + ' MB'
    }
    const [drop, setDrop] = useState(false);

    const onDragLeave = (e) => {
        //if (disabled) return;
        e.preventDefault()
        setDrop(false)
    };

    const onDragOver = (e) => {
        //if (disabled) return;
        e.preventDefault()
        setDrop(true)
    };

    const handleDrop = (e) => {
        //if (disabled) return;
        e.preventDefault()
        setDrop(false)
        const newFiles = Array.from(e.dataTransfer.files).filter((file) => file.name.includes('.pdf'))
        if (newFiles.length !== e.dataTransfer.files.length) {
            setInvalidFmtWarning(true)
        }
        else {
            setInvalidFmtWarning(false)
        }
        setFiles(chosenFiles.concat(newFiles))
    };

    // useEffect(() => {
    //     getAllBrands()
    //       .then(responseData => {
    //         setavailableBrands(responseData)
    //       })
    //       .catch(error => {
    //         console.log('Error fetching data:', error)
    //       })
    //   }, [])


  return (
    <section id={classes.admin}>
        <div className={classes.creation}>
            <p className={classes['creation-title']}>Добавление файлов</p>
            <p className={classes['creation-info-text']}>Выберите файлы, которые хотите добавить. Названия файлов будут сохранены в качестве имён документов.</p>
            <p className={classes['creation-info-text']}>Вы также можете добавить комментарий для отслеживания истории добавления.</p>
            {/* <form onSubmit={handleBrandSubmit} method='post' encType='multipart/form-data'> */}
            <form onSubmit={handleBrandSubmit}>
                <div>
                    <label 
                        for="doc_upload"
                        onDrop={handleDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        >
                        <p>Выберите документы (PDF)<span>*</span></p>
                        <p className={classes['upload-file-dnd-info']}>
                            Или перетащите сюда файлы
                            {(drop ? (<p className='fa fa-dropbox'></p>) : (<p></p>))}
                        </p>
                    </label>
                    <input
                        onChange={handlePickFiles}
                        type="file"
                        className={classes['upload-file']}
                        id="doc_upload"
                        name="doc_upload"
                        accept=".pdf"
                        multiple 
                        required
                        ref={fileInput}
                    />
                    <input name="brandname" type="text" placeholder='Комментарий (необязательно)'></input>
                </div>
                <div className={classes.preview}>
                    {!chosenFiles.length ? (<p>Файлы не выбраны.</p>) : 
                    (    
                        <>  
                        <h5>Выбранные файлы</h5>                  
                        {chosenFiles.map((file, index) =>
                            <div className={classes['chosen-file']}>
                                <div className={classes['chosen-file-info-block']}>
                                    <p className={classes['chosen-file-info']}><b>Название: </b>{file.name}</p>
                                    <p className={classes['chosen-file-info']}><b>Размер: </b>{getPrettifiedSize(file.size)}</p>
                                </div>
                                <div className='fa fa-trash' data-value={index} onClick={handleFileDelete}></div>
                            </div>
                        )}
                        </>
                    )}
                </div>
                <button className={classes['creation-submit-button']} type="submit">Добавить файлы</button>
            </form>
            {invalidFmtWarning ? 
                (<p className={classes.warning}>Некоторые файлы не были добавлены из-за неподходящего расширения</p>)
                : 
                (null) 
            }
        </div>
    </section>
  );
};
export default Admin;