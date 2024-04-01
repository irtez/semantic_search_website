import React, { useState, useEffect } from 'react'
import { getMe, updateUser } from '../../http/userAPI'
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';
import classes from './User.module.css' 
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InventoryIcon from '@mui/icons-material/Inventory';
import HomeIcon from '@mui/icons-material/Home';
import Loading from '../Loading';
import './User.css'


// const PrevMessages = () => {
//   const [messagesData, setMessagesData] = useState(null)
//   const handleChange = async (event) => {
//     if (event.target.value !== "all") {
//       const status = event.target.value
//       const data = await getAllUser(status)
//       console.log(data)
//       setMessagesData(data)
//     }
//   }
//   const width = window.innerWidth
//   const charactersPerParagraph = Math.floor(width/24.77)
//   return (
//     <>
//     <div className={classes.allprev}>
//       {messagesData ? (
//         messagesData.map(message => {
//           const paragraphs = [];
//           const paragraphCount = Math.fround(message.text.length / charactersPerParagraph)
//           for (let i = 0; i < paragraphCount; i++) {
//             const start = i * charactersPerParagraph;
//             const end = start + charactersPerParagraph;
//             const paragraphText = message.text.substring(start, end);
//             paragraphs.push(<p key={i}>{paragraphText}</p>);
//           }
//           return (
//             <div className={classes.prev}>
//               <h4>▶Обращение №{messagesData.indexOf(message)+1}</h4>
//               <p><b>Тема:</b> {message.title}</p>
//               <p><b>Текст:</b></p>
//               {paragraphs}
//             </div>
//           )
//         })
//       ) : (<p>Ничего не найдено.</p>)}
//     </div>
//     </>
//   )
// }

const SavedCollections = () => {
  const [collectionsData, setCollectionData] = useState(null)
  return (
    <>
    <div className={classes.allprev}>
      {collectionsData ? (
        collectionsData.map(collection => {
          return (
            <div className={classes.prev}>
            </div>
          )
        })
      ) : (<p>Ничего не найдено.</p>)}
    </div>
    </>
  )
}

const User = () => {
    const [data, setData] = useState(null)
    const [isSectionProfile, setViewedSection] = useState(true)
    const { user } = useContext(AppContext)
    useEffect(() => {
        getMe()
          .then(responseData => {
            setData(responseData)
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [])

    if (!data) {
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

  const handleProfile = (event) => {
    setViewedSection(true)
  }
  const handleMessages = (event) => {
    setViewedSection(false)
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
        <ListItemButton selected={isSectionProfile} onClick={handleProfile}>
          <ListItemIcon >
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Ваши данные" />
        </ListItemButton>
        
        <ListItemButton selected={!isSectionProfile} onClick={handleMessages}>
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Сохраненные коллекции" />
        </ListItemButton>
        
      </List>
      <div className={classes.back}>
      </div>
      <div className={classes.usermain}>
      {isSectionProfile ? (
        
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
          <div className={classes.prevmessages}>
            <h1>Ваши коллекции</h1>
            <SavedCollections/>
          </div>
          </>
        )}
      
        
      </div>
    </section>
  )
}

export default User