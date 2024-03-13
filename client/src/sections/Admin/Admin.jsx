import React, { useState, useEffect } from 'react';
import classes from './Admin.module.css'
import { createBrand, getAllBrands } from '../../http/brandAPI';
import { createCar } from '../../http/carAPI';
import { getAllAdmin, changeStatus } from '../../http/messageAPI';
import Loading from '../Loading';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Messages = () => {
    const [messages, setMessages] = useState(null)

    useEffect(() => {
        getAllAdmin('opened')
          .then(responseData => {
            setMessages(responseData)
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [])

    if (!messages) {
        return <Loading/>
    }

    const handleClose = async (event) => {
        let data = {}
        data['id'] = event.target.value
        data['status'] = 'closed'
        try {
            const newMessage = await changeStatus(data)
            if (newMessage) {
                alert('Обращение закрыто')
                window.location.reload()
            }
        } catch (e) {
            console.log(e)
            alert('Ошибка')
        }
    }

    const width = window.innerWidth
    console.log(width)
    const charactersPerParagraph = Math.floor(width/13.757) //108
    return (
        <div className={classes.userMessage}>
            <h4>Открытые обращения пользователей</h4>
            {messages.map(message => {
                const date = new Date(Number(message.timestamp))
                const paragraphs = [];
                const paragraphCount = Math.fround(message.text.length / charactersPerParagraph)
                for (let i = 0; i < paragraphCount; i++) {
                    const start = i * charactersPerParagraph;
                    const end = start + charactersPerParagraph;
                    const paragraphText = message.text.substring(start, end);
                    paragraphs.push(<p key={i}>{paragraphText}</p>);
                }
                return (
                <div className={classes.usermsg}>
                    <Accordion>
                        <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        >
                        <Typography>Обращение по теме «{message.title}»</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Typography  style={{padding: "2em", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start"}}>
                            <ul>
                                <li><b>Почта пользователя:</b> {message.useremail}</li>
                                <li><b>Имя пользователя:</b> {message.username}</li>
                                <li><b>Телефон пользователя:</b> {message.userphone}</li>
                                <li><b>Время отправки:</b> {String(date)}</li>
                                <li><b>Текст:</b> 
                                    {paragraphs}
                                </li>
                            </ul>
                            <button value={message._id} onClick={handleClose}>Закрыть обращение</button>
                        </Typography>
                        </AccordionDetails>
                        
                    </Accordion>
                </div>)

            })}
        </div>
    )

}

const Admin = () => {
    //brand
    const [selectedBrandImage, setselectedBrandImage] = useState(null)
    const [newBrand, setnewBrand] = useState(null)

    const handleBrandSubmit = async (event) => {
        try {
            event.preventDefault()
            const brandName = event.target.brandname.value.trim()
            const formData = new FormData()
            formData.append('image', selectedBrandImage)
            formData.append('name', brandName)
            const response = await createBrand(formData)
            setnewBrand({name: response.name, imgurl: response.img})
            event.target.brandname.value = ""
            event.target.brandimg.value = ""
            setselectedBrandImage(null)
        } catch (error) {
            console.error("Error creating brand:", error)
        }
    }
    const handleBrandImgUpload = (event) => {
        setselectedBrandImage(event.target.files[0])
    }

    //car
    const [newCar, setnewCar] = useState(null)
    const [availableBrands, setavailableBrands] = useState(null)
    const [selectedCarImage, setselectedCarImage] = useState(null)
    const [selectedCarBrand, setselectedCarBrand] = useState(null)

    const chooseCarModel = (event) => {
        setselectedCarBrand(event.target.value)
    }

    const chooseCarPhoto = (event) => {
        setselectedCarImage(event.target.files[0])
    }

    const handleCarSubmit = async (event) => {
        try {
            event.preventDefault()
            const formData = new FormData()
            formData.append("name", event.target.carmodel.value.trim())
            formData.append("year", event.target.caryear.value.trim())
            formData.append("engine", event.target.carengine.value.trim())
            formData.append("body", event.target.carbody.value.trim())
            formData.append("transmission", event.target.cartransmission.value.trim())
            formData.append("mileage", event.target.carmileage.value.trim())
            formData.append("image", selectedCarImage)
            formData.append("brand", selectedCarBrand)
            formData.append("configuration", event.target.carconfig.value.trim())
            formData.append("price", event.target.carprice.value.trim())
            formData.append("color", event.target.carcolor.value.trim())
            
            const response = await createCar(formData)
            setnewCar({
                name: response.name,
                year: response.year,
                body: response.body,
                engine: response.engine,
                transmission: response.transmission,
                mileage: response.mileage,
                imgurl: response.img,
                brand: response.brand,
                configuration: response.configuration,
                price: response.price,
                color: response.color
            })
            setselectedCarBrand(null)
            setselectedCarImage(null)
            event.target.carmodel.value = ""
            event.target.carconfig.value = ""
            event.target.caryear.value = ""
            event.target.carbody.value = ""
            event.target.carengine.value = ""
            event.target.cartransmission.value = ""
            event.target.carmileage.value = ""
            event.target.carimg.value = ""
            event.target.carcolor.value = ""
            event.target.carprice.value = ""
            event.target.choosecarbrand.value = ""

        } catch (error) {
            console.error("Error creating car:", error)
        }
        

    }

    useEffect(() => {
        getAllBrands()
          .then(responseData => {
            setavailableBrands(responseData)
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [])


  return (
    <section id={classes.admin}>
        <div className={classes.creation}>
            <p>Создание бренда</p>
            <form onSubmit={handleBrandSubmit}>
                <input name="brandname" type="text" placeholder='Название бренда' required></input>
                <input name="brandimg" type="file" onChange={handleBrandImgUpload} required/>
                <button type="submit">Создать бренд</button>
            </form>
            {newBrand && (
                <div className={classes.brandCreated}>
                    <p>Создан новый бренд {newBrand.name}</p>
                    <img src={newBrand.imgurl} alt="newBrand"></img>
                </div>
                ) 
            }
        </div>
        <div className={classes.creation}>
            <p>Создание автомобиля</p>
            <form onSubmit={handleCarSubmit}>
                <input name="carmodel" type="text" placeholder='Модель автомобиля' required/>
                <input name="carconfig" type="text" placeholder='Комплектация' required/>
                <input name="caryear" type="text" placeholder='Год выпуска' required/>
                <input name="carengine" type="text" placeholder='Информация о двигателе' required/>
                <input name="carbody" type="text" placeholder='Тип кузова' required/>
                <input name="cartransmission" type="text" placeholder='Трансмиссия' required/>
                <input name="carmileage" type="text" placeholder='Пробег' required/>
                <input name="carimg" type="file" onChange={chooseCarPhoto} required/>
                <input name="carcolor" type="text" placeholder='Цвет' required/>
                <input name="carprice" type="text" placeholder='Цена' required/>
                {availableBrands ? (
                    <select name="choosecarbrand" onChange={chooseCarModel}>
                        <option value="">Бренд автомобиля:</option>
                        {availableBrands.map( item => <option value={item.name}>{item.name}</option> )}
                    </select>
                ) : (
                    <p>Загрузка...</p>
                )}
                <button type="submit">Создать автомобиль</button>
            </form>
            {newCar && (
                <div className={classes.carCreated}>
                    <p>Создан новый автомобиль <b>{newCar.brand} {newCar.name}</b></p>
                    <p>Комплектация: {newCar.configuration}</p>
                    <p>Год выпуска: {newCar.year}</p>
                    <p>Двигатель: {newCar.engine}</p>
                    <p>Тип кузова: {newCar.body}</p>
                    <p>Трансмиссия: {newCar.transmission}</p>
                    <p>Пробег: {newCar.mileage} км</p>
                    <p>Цвет: {newCar.color}</p>
                    <p>Цена: {newCar.price} ₽</p>
                    <img src={newCar.imgurl} alt="newBrand"></img>
                </div>
                ) 
            }
        </div>
        <Messages/>
    </section>
  );
};
//name, year, engine, body, transmission, mileage, img, brand
export default Admin;