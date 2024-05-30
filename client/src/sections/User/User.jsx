import React, { useState, useEffect } from 'react'
import { getMe, updateUser } from '../../http/userAPI'
import { createCollection, getCollections, deleteCollection, editCollection } from '../../http/collectionAPI'
import classes from './User.module.css' 
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InventoryIcon from '@mui/icons-material/Inventory';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import Loading from '../Loading';
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Checkbox from '@mui/material/Checkbox'
import './User.css'


const maxCollections = 5
const maxDocuments = 30

const SavedCollections = (props) => {
  const userCollections = props.collections
  const setCollections = props.editCollectionsFn
  const [collectionToDelete, setCollectionToDelete] = useState(null)
  const [docsToDelete, setDocsToDelete] = useState([])
  const [isDeletingDocs, setIsDeletingDocs] = useState(false)
  const [isDeletionPending, setIsDeletionPending] = useState(false)
  
  const handleDeleteCollection = async (e) => {
    setIsDeletionPending(true)
    try {
      const response = await deleteCollection(collectionToDelete)
      if (response.status === 200) {
        const updatedCollections = userCollections.filter(col => col._id !== collectionToDelete)
        setCollections([...updatedCollections])
        setCollectionToDelete(null)
      }
    }
    catch (e) {
      console.log(e)
    }
    setIsDeletionPending(false)
  }

  const handleDocSelect = (e) => {
    const docId = e.target.value
    if (docsToDelete.includes(docId)) {
      setDocsToDelete([...docsToDelete.filter(doc => doc !== docId)])
    }
    else {
      setDocsToDelete([...docsToDelete, docId])
    }
  }
  
  const handleDocDelete = (e) => {
    if (!isDeletingDocs) {
      setIsDeletingDocs(true)
    }
    else {
      setDocsToDelete([])
      setIsDeletingDocs(false)
    }
  }

  const deleteDocs = async (colId) => {
    setIsDeletionPending(true)
    try {
      const response = await editCollection({
        collectionId: colId,
        delete: docsToDelete
      })
      if (response.status === 200) {
        setIsDeletingDocs(false)
        setDocsToDelete([])
        
        const curCollection = userCollections.filter(col => col._id === colId)[0]
        const updatedDocs = curCollection.documents.filter(doc => !docsToDelete.includes(doc.id))
        const updatedCollections = userCollections.map(collection =>
          collection._id === colId ? { ...collection, documents: updatedDocs } : collection
        )
        setCollections(updatedCollections)
      }
    }
    catch (e) {
      console.log(e)
    }
    setIsDeletionPending(false)
  }
  
  return (
    <div className={classes['collection']}>
      {userCollections.length ? (
        userCollections.map(col => {
          return (
            <div className={classes['collection-inner']}>
              <Accordion style={{
                borderRadius: "10px", 
                boxShadow: "0px 0px 8px 0px rgba(34, 60, 80, 0.49)",
                width: "100%"
              }}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                style = {{border: "1px solid black", borderRadius: "10px"}}
                >
                <Typography >
                  Коллекция «{col.name}» (документов: {col.documents.length}/{maxDocuments})
                </Typography>
                </AccordionSummary>
                <AccordionDetails >
                <Typography style={
                  {
                    padding: "3em", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "flex-start", 
                    alignItems: "flex-start"
                  }
                }>
                  {!isDeletionPending ? 
                  (<>{col.documents.length > 0 ? (
                    <div className={classes['delete-docs']}>
                      <button onClick={handleDocDelete}>
                        {!isDeletingDocs ? ('Удалить документы') : ('Отменить удаление')}
                      </button>
                      {docsToDelete.length > 0 ? (
                        <p className='fa fa-trash' style={{marginLeft: "10px"}} onClick={() => deleteDocs(col._id)}></p>
                      ) : ('')}
                    </div>
                  ) : ('')}
                    <ul>
                      {col.documents.map(doc => {
                          return <li>
                                {isDeletingDocs ? (
                                <div className={classes['choose-document']}>
                                  <Checkbox 
                                    color="error" 
                                    checked={docsToDelete.includes(doc.id)}
                                    onClick={handleDocSelect}
                                    value={doc.id}
                                  />
                                </div>
                              ) : ('')}
                                <Link 
                                  to={'/docs/' + doc.id}
                                  onClick={() => {window.scrollTo({top: 0, behavior: 'smooth'})}}
                                >
                                  ○ {doc.gost_number}. {doc.title} ({doc.status})
                                </Link>
                            </li>
                          
                        })
                      }
                    </ul>
                    <div className={classes['collection-delete']}>
                      <button onClick={() => setCollectionToDelete(col._id)}>Удалить коллекцию</button>
                      {collectionToDelete ? (
                        <div className={classes['delete-confirmation']}>
                          <p>Удалить?</p>
                          <p className='fa fa-trash' onClick={() => handleDeleteCollection()}></p>
                          <p className='fa fa-times'onClick={() => setCollectionToDelete(null)}></p>
                        </div>
                      ) : ('')}
                    </div></>) : (
                      <div className={classes['doc-delete-loading']}>
                        <Loading height='6em' spinnerSize='6em'/>
                      </div>
                    )
                  }
                </Typography>
                </AccordionDetails>
            </Accordion>
            </div>
          )
        })
      ) : (<p style={{width: "100%", textAlign: "center"}}>У вас пока нет созданных коллекций.</p>)}
    </div>
  )
}

const User = () => {
    const [data, setData] = useState(null)
    const [viewedSection, setViewedSection] = useState(true)
    const [isCreateExpanded, setIsCreateExpanded] = useState(false)
    const [newCollectionName, setNewCollectionName] = useState('')
    const [latestCollectionCreated, setLatestCollectionCreated] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const [collectionsData, setCollectionsData] = useState([])
    
    useEffect(() => {
        getMe()
          .then(responseData => {
            setData(responseData)
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [])
    
    useEffect(() => {
      getCollections()
        .then(responseData => {
          setCollectionsData(responseData.collections)
        })
        .catch(error => {
          console.log('Error fetching data:', error)
        })
    }, [])

    useEffect(() => {
      const params = new URLSearchParams(location.search)
      const section = params.get('section')
      setViewedSection(section || 'data')
    }, [location.search])

    if (!data || !collectionsData) {
        return (
            <Loading/>
        )
    }
    const userdata = data.data.user
    const changeHandle = async (event) => {
        event.preventDefault()
        const field = event.target[0].attributes.name.value.trim()
        let value = event.target[0].value.trim()
      
        let c = {}
        c[field] = value
        if (field === "password") {
            const oldpass = event.target[1].value.trim()
            c['oldpass'] = oldpass
        }
        const changed = await updateUser(c)
        if (changed === "password") {
            alert('Пароль успешно изменен')
        }
        if (changed)
          window.location.reload()
    }

  const createNewCollection = async (e) => {
    const response = await createCollection({collectionName: newCollectionName})
    if (response.status === 200) {
      setLatestCollectionCreated(response.data.name)
      const userCollections = [...collectionsData]
      userCollections.push(response.data)
      setCollectionsData(userCollections)
    }
  }


  const handleExpand = (e) => {
    setIsCreateExpanded(!isCreateExpanded)
    setLatestCollectionCreated('')
  }

  const handleSectionChange = (newSection) => {
    console.log(newSection)
    const params = new URLSearchParams(window.location.search)
    params.set('section', newSection)
    navigate(`?${params.toString()}`, { replace: true })
  }



  return (
    <section id={classes.user}>

      <List
        sx={{ width: '500px', maxWidth: 360, bgcolor:'gray', color: "black"}}
        style={{marginRight: "5em", height: "100%"}} 
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Личный кабинет
          </ListSubheader>
        }
      >
        <ListItemButton selected={viewedSection === 'data'} onClick={() => handleSectionChange('data')}>
          <ListItemIcon >
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Ваши данные" />
        </ListItemButton>

        <ListItemButton selected={viewedSection === 'collections'} onClick={() => handleSectionChange('collections')}>
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Сохраненные коллекции" />
        </ListItemButton>
        
      </List>
      <div className={classes.back}>
      </div>
      <div className={classes.usermain}>
      {(viewedSection === 'data') ? (
        
          <div className={classes.usercard}>
            <h4><b>Ваши данные</b></h4>  
            <p>Электронная почта: {userdata.email}</p>
            <div className={classes.usercardinfo}>
              <p>Имя: {userdata.name}</p>
              <form onSubmit={changeHandle}>
                <input name="name" type="text" placeholder='Новое имя' required></input>
                <button type="submit">Изменить имя</button>
              </form>
            </div>
            
            <div className={classes.usercardinfo}>
              <form onSubmit={changeHandle}>
                <input name="password" type="password" placeholder='Новый пароль' required></input>
                <input name="oldpass" type="password" placeholder='Старый пароль' required></input>
                <button type="submit">Изменить пароль</button>
                {data.pc ? (<p>Пароль успешно изменен</p>) : null}
              </form>
            </div>
          </div>
        
      ) : (
          <>
          <div className={classes['collections']}>
          <h2>Ваши коллекции</h2>
            <div className={classes['collections-upper']}>
              <div className={classes['create-button']}>
                <button 
                  disabled={collectionsData.length >= maxCollections}
                  title={(collectionsData.length >= maxCollections) ? (
                    `Вы можете создать не более ${maxCollections} коллекций`
                  ) : ('')}
                  onClick={handleExpand}
                >
                  ➕ Создать коллекцию
                </button>
                {
                  isCreateExpanded ? (
                    <div className={classes['collection-create']}>
                      <input 
                        type='text' 
                        placeholder='Название коллекции' 
                        onChange={(e) => setNewCollectionName(e.target.value.substring(0,20))}
                        value={newCollectionName}
                      ></input>
                      {!latestCollectionCreated ? (
                        <button onClick={createNewCollection}>Создать</button>
                      ) : (
                        <p>Создана новая коллекция "{latestCollectionCreated}"</p>
                      )
                      }
                      
                    </div>
                  ) : (
                    ''
                  )
                }
              </div>
            </div>
            <SavedCollections collections={collectionsData} editCollectionsFn={setCollectionsData}/>
          </div>
          </>
        )}
      </div>
    </section>
  )
}

export default User