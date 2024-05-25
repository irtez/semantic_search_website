import React, { useState, useEffect} from 'react';
import classes from './Document.module.css'
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOne, downloadOne, editDocument, deleteDocument } from '../../http/documentAPI';
import { getSimilarDocs } from '../../http/searchAPI';
import Loading from '../Loading';
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';



const Document = () => {
    const { id } = useParams()
    const [doc, setDoc] = useState(null)
    const [editedDoc, setEditedDoc] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [fileUrl, setFileUrl] = useState(null)
    const navigate = useNavigate()
    const { user } = useContext(AppContext)
    const [isUpdatePending, setIsUpdatePending] = useState(false)
    const [similarDocs, setSimilarDocs] = useState(null)
    const [simType, setSimType] = useState('title')

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

      useEffect(() => {
        getSimilarDocs(id)
          .then(responseData => {
            if (!responseData) {
              setSimilarDocs('not found')
            }
            else {
              setSimilarDocs(responseData.data)
            }
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [id])

    
    if (!(doc && fileUrl)) {
        return <Loading/>
    }
    
    const getDisplayValue = (field) => {
      return (editedDoc && editedDoc[field] !== undefined) ? editedDoc[field] : doc[field] || ''
    }

    const setNewDocInfo = (data) => {
      if (data.title) {
        const newTitlePos = data.title.indexOf('.') + 2
        setEditedDoc({...editedDoc, title: data.title.slice(newTitlePos, data.title.length) || ''})
      }
      else {
        setEditedDoc({...editedDoc, ...data})
      }
    }

    const handleEdit = (e) => {
      if (!isEditing) {
        if (!editedDoc) {
          setEditedDoc({})
        }
        setIsEditing(true)
      }
      else {
        if (!(Object.values(editedDoc).some(value => value !== ''))) {
            setEditedDoc(null)
          }
        setIsEditing(false)
      }
    }

    const handleSave = async (e) => {
      setIsUpdatePending(true)
      
      try {
        const response = await editDocument(id, editedDoc)
        if (response.status === 200) {
          setDoc(response.data.document)
          setIsEditing(false)
          setEditedDoc(null)
        }
      }
      catch (e) {
        console.log(e)
      }
      
      setIsUpdatePending(false)
    }

    const handleDeletion = async (e) => {
      setIsUpdatePending(true)
      const response = await deleteDocument(id)
      if (response.status === 200) {
        setIsUpdatePending(false)
        navigate('/', { replace: true })
      }
    }

  return (
    <section id={classes.doc}>
      <div className={classes['similar-docs']}>
        <Accordion style={{
          borderRadius: "10px", 
          boxShadow: "0px 0px 8px 0px rgba(34, 60, 80, 0.49)",
          width: "100%"
        }} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            style = {{border: "1px solid black", borderRadius: "10px"}}
          >
            <Typography >
                  Похожие документы
            </Typography>
          </AccordionSummary>
            <AccordionDetails >
              <Typography style={
                  {
                    padding: "10px", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center",
                    gap: "30px"
                  }
              }>
                <ToggleButtonGroup
                  color="info"  
                  value={simType}
                  onChange={(e) => setSimType(e.target.value)}
                  exclusive
                  aria-label="Platform"
                >
                  <ToggleButton value='title'>По названию</ToggleButton>
                  <ToggleButton value='text'>По содержанию</ToggleButton>
                </ToggleButtonGroup>
                {similarDocs ? (
                  similarDocs[simType].length ? (
                    <ul>
                    {similarDocs[simType].map(doc => {
                      return <li 
                          dataAttr={'Близость: ' + Math.round(doc.similarity_score * 10000)/100 + '%'} 
                          style={{paddingBottom: "30px", lineHeight: "1.2", textAlign: "justify"}}
                        >
                          <Link to={`/docs/${doc._id}`} style={{color: "black"}}>
                            {doc.gost_number}. {doc.title} <span style={{fontStyle: "italic"}}>({doc.status})</span>
                          </Link>
                        </li>
                    })}
                    </ul>)
                    : 
                    (<p>Документы не найдены.</p>)
                ) 
                : 
                (similarDocs === 'not found' ? 
                  ('Документы не найдены') 
                  : 
                  (
                    <div className={classes['loading-holder']}>
                      <Loading height='100%' spinnerSize='60px'/>
                    </div>
                  )
                )}
              </Typography>
            </AccordionDetails>
        </Accordion>
      </div>
      <div className={classes['doc-info']}>
        {!isUpdatePending ? (
          <>
          {user.isAdmin ? (
            <div className={classes['edit-button-holder']}>
              {editedDoc ? (<p className={classes['changes-not-saved']}>Изменения не сохранены</p>) : ('')}
              {isDeleting ? (
                <p onClick={handleDeletion} className={classes['delete-confirm-button']}>Удалить</p>
              ) : ('')}
              {isEditing ? (
                <p onClick={() => setIsDeleting(!isDeleting)} className={'fa fa-trash ' + classes['delete-button']}></p>
                ) : ('')
              }
              <p onClick={handleEdit} className={'fa fa-edit ' + classes['edit-button']}></p>
            </div>
          ) : ('')}
          <p><b>Наименование: </b> 
          {
            isEditing ? (
              <input 
                type='text' 
                value={doc.gost_number + '. ' + (getDisplayValue('title'))} 
                onChange={(e) => setNewDocInfo({title: e.target.value})}
              ></input>
            ) : (doc.gost_number + '. ' + doc.title)
          }
          </p>
          <p><b>Статус: </b>
          {
            isEditing ? (
              <input 
                type='text' 
                value={getDisplayValue('status')} 
                onChange={(e) => setNewDocInfo({status: e.target.value})}
              ></input>
            ) : (doc.status || '-')
          }
          </p>
          <p><b>Дата принятия: </b>
          {
            isEditing ? (
              <input 
                type='text' 
                value={getDisplayValue('date_start')} 
                onChange={(e) => setNewDocInfo({date_start: e.target.value})}
              ></input>
            ) : (doc.date_start || '-')
          }
          </p>
          <p><b>Дата отмены: </b> 
          {
            isEditing ? (
              <input 
                type='text' 
                value={getDisplayValue('date_cancel')} 
                onChange={(e) => setNewDocInfo({date_cancel: e.target.value})}
              ></input>
            ) : (doc.date_cancel || '-')
          }
          </p>
          <p><b>Заменен на: </b> 
          {
            isEditing ? (
              <input 
                type='text' 
                value={getDisplayValue('replaced_by')} 
                onChange={(e) => setNewDocInfo({replaced_by: e.target.value})}
              ></input>
            ) : (doc.replaced_by || '-')
          }
          </p>
          <p><b>Основной раздел ОКС: </b> 
          {
            isEditing ? (
              <input 
                type='text' 
                value={getDisplayValue('main_section')} 
                onChange={(e) => setNewDocInfo({main_section: e.target.value})}
              ></input>
            ) : (doc.main_section || '-')
          }
          </p>
          <p><b>Подраздел ОКС: </b> 
          {
            isEditing ? (
              <input 
                type='text' 
                value={getDisplayValue('subsection')} 
                onChange={(e) => setNewDocInfo({subsection: e.target.value})}
              ></input>
            ) : (doc.subsection || '-')
          }
          </p>
          <p><b>ОКС: </b> 
          {
            isEditing ? (
              <input 
                type='text' 
                value={getDisplayValue('OKS')} 
                onChange={(e) => setNewDocInfo({OKS: e.target.value})}
              ></input>
            ) : (doc.OKS || '-')
          }
          </p>
          {
            (fileUrl !== 'not found') ? (
              <p>
                <b>Скачать:</b> <a href={fileUrl} download={doc.filename}>{doc.filename}</a>
              </p>
            ) : (
              <p>Файл отсутствует.</p>
            )
  
          }
          {
            isEditing ? (
              <div className={classes['save-button-holder']}>
                <p onClick={handleSave} className={'fa fa-floppy-o'}> Сохранить</p>
              </div>
          ) : ('')
          }
          </>
        ) : (
        <div className={classes['loading-holder']}>
          <Loading height='200px' spinnerSize='100px'/>
        </div>
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
              (doc.text_markdown ? (
                <div dangerouslySetInnerHTML={
                  { __html: doc.text_markdown}
                }>
                </div>
              ) : (doc.text_plain)
              )
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