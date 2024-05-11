import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import classes from './Document.module.css'
import { useParams, useNavigate } from 'react-router-dom';
import { getOne, downloadOne } from '../../http/fileAPI';
import Loading from '../Loading';
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';


const Document = () => {
    const { id } = useParams()
    const [doc, setDoc] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [fileUrl, setFileUrl] = useState(null)
    const navigate = useNavigate()
    const { user } = useContext(AppContext)
    useEffect(() => {
        getOne(id)
          .then(responseData => {
            if (!responseData) {
                navigate('/', { replace: true })
            }
            setDoc(responseData.data)
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [id, navigate])

      useEffect(() => {
        downloadOne(id)
          .then(responseData => {
            if (!responseData) {
              setFileUrl('not found')
            }
            else {
              setFileUrl(URL.createObjectURL(responseData.data))
            }
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [id])

    
    if (!(doc && fileUrl)) {
        return <Loading/>
    }
    


  return (
    <section id={classes.doc}>
      <div className={classes['doc-info']}>
        <p><b>Наименование:</b> {doc.gost_number + '. ' + doc.title}</p>
        <p><b>Статус:</b> {doc.status}</p>
        <p><b>Дата принятия:</b> {doc.date_start}</p>
        <p><b>Дата отмены:</b> {doc.date_cancel}</p>
        <p><b>Замнен на:</b> {doc.replaced_by}</p>
        <p><b>Основной раздел ОКС:</b> {doc.main_section}</p>
        <p><b>Подраздел ОКС:</b> {doc.subsection}</p>
        <p><b>ОКС:</b> {doc.OKS}</p>
        {
          (fileUrl !== 'not found') ? (
            <p>
              <b>Скачать:</b> <a href={fileUrl} download={doc.filename}>{doc.filename}</a>
            </p>
          ) : (
            <p>Файл отсутствует.</p>
          )

        }
        
      </div>

      <div className={classes['doc-text']}>
        <p className={classes['doc-text-title']}>ТЕКСТ ДОКУМЕНТА</p>
        {(fileUrl !== 'not found') ? (
            doc.filename.endsWith('.pdf') ? 
              (<Worker workerUrl="/pdf.worker.min.js">
              <Viewer fileUrl={fileUrl} />
              </Worker>)
              :
              (<p dangerouslySetInnerHTML={
                  { __html: doc.text_markdown}
                }></p>)
          ) : (
            <p dangerouslySetInnerHTML={
              { __html: doc.text_markdown}
            }></p>
          )}
      </div>
    </section>
  )
}

export default Document;