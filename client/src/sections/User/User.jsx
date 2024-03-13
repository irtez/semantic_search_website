import React, { useState, useEffect } from 'react'
import { getMe, updateUser } from '../../http/userAPI'
import { TextField, Button } from '@mui/material';
import { createMessage } from '../../http/messageAPI';
import { InputLabel, Select, MenuItem } from '@mui/material';
import { getAllUser } from '../../http/messageAPI';
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';
import classes from './User.module.css'
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SendIcon from '@mui/icons-material/Send';
import HomeIcon from '@mui/icons-material/Home';
import Loading from '../Loading';

const MessageForm = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = {}
    data['title'] = e.target.messagetitle.value.trim()
    data['text'] = e.target.messagetext.value
    data['timestamp'] = Date.now()
    try {
      const response = await createMessage(data)
      if (response) {
        window.location.reload()
      } else {
        alert('Ошибка при отправке запроса на сервер')
      }
    } catch (e) {
      console.log(e)
      alert('Ошибка при отправке обращения')
    }
  };
  return (
    <form onSubmit={handleSubmit} >
      <TextField
        id="subject"
        name="messagetitle"
        label="Тема"
        required
        variant="outlined"
        style={{width: "100%"}}
      />
      <TextField
        id="message"
        name="messagetext"
        label="Текст обращения"
        required
        multiline
        rows={5}
        variant="outlined"
        style={{width: "100%"}}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        style={{alignSelf: "center"}}
      >
        Отправить обращение
      </Button>
    </form>
  )
}

const PrevMessages = () => {
  const [messagesData, setMessagesData] = useState(null)
  const handleChange = async (event) => {
    if (event.target.value !== "all") {
      const status = event.target.value
      const data = await getAllUser(status)
      console.log(data)
      setMessagesData(data)
    }
  }
  const width = window.innerWidth
  const charactersPerParagraph = Math.floor(width/24.77)
  return (
    <>
    <div>
      <InputLabel id="select-label">Выберите статус обращения</InputLabel>
      <Select
        id="select"
        onChange={handleChange}
        labelId="select-label"
        defaultValue="all"
      >
        <MenuItem value="all">Выберите статус:</MenuItem>
        <MenuItem value="opened">Открытые</MenuItem>
        <MenuItem value="closed">Закрытые</MenuItem>
      </Select>
    </div>
    <div className={classes.allprev}>
      {messagesData ? (
        messagesData.map(message => {
          const paragraphs = [];
          const paragraphCount = Math.fround(message.text.length / charactersPerParagraph)
          for (let i = 0; i < paragraphCount; i++) {
            const start = i * charactersPerParagraph;
            const end = start + charactersPerParagraph;
            const paragraphText = message.text.substring(start, end);
            paragraphs.push(<p key={i}>{paragraphText}</p>);
          }
          return (
            <div className={classes.prev}>
              <h4>▶Обращение №{messagesData.indexOf(message)+1}</h4>
              <p><b>Тема:</b> {message.title}</p>
              <p><b>Текст:</b></p>
              {paragraphs}
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
    const [phoneNumber, setPhoneNumber] = useState(null)
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
        if (field === "phone") {
          value = phoneNumber.replace(/\D/g, '')
        }

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

    
    function handlePhoneChange(event) {
      let phone = event.target.value.replace(/\D/g, ''); // удаляем все нецифровые символы из ввода
      if (phone.length === 0) { // дополнительная проверка на длину
        setPhoneNumber('')
      } else if (phone.length <= 1) { // форматируем телефон X
        setPhoneNumber(`${phone}`)
      } else if (phone.length <= 4) { // форматируем телефон X-XXX
        setPhoneNumber(`${phone.substring(0, 1)} (${phone.substring(1, 4)}`)
      } else if (phone.length <= 7) { // форматируем телефон X (XXX) XXX
        setPhoneNumber(`${phone.substring(0, 1)} (${phone.substring(1, 4)}) ${phone.substring(4, 7)}`)
      } else if (phone.length <= 9){
        setPhoneNumber(`${phone.substring(0, 1)} (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7, 9)}`)
      } else {
        setPhoneNumber(`${phone.substring(0, 1)} (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7, 9)}-${phone.substring(9, 11)}`)
      }
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
        <ListItemButton onClick={handleProfile}>
          <ListItemIcon >
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Ваши данные" />
        </ListItemButton>
        {user.isAdmin ? ("") : (
          <ListItemButton value="send" onClick={handleMessages}>
          <ListItemIcon>
            <SendIcon />
          </ListItemIcon>
          <ListItemText primary="Обращения" />
        </ListItemButton>
        )}
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
              <p>Телефон: {userdata.phone}</p>
              <form onSubmit={changeHandle}>
                <input name="phone" type="text" placeholder='Новый телефон' onChange={handlePhoneChange} value={phoneNumber} required></input>
                <button type="submit">Изменить телефон</button>
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
        
      ) : (user.isAdmin ? (null) : (
          <>
          <div className={classes.prevmessages}>
            <h1>Оставить обращение</h1>
            <MessageForm/>
          </div>
          <div className={classes.prevmessages}>
            <h1>Предыдущие обращения</h1>
            <PrevMessages/>
          </div>
          </>
        ))}
      
        
      </div>
    </section>
  )
}

export default User