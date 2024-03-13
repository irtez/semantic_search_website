import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import classes from './Car.module.css'
import bodytype from './bodytype.svg'
import engine from './engine.svg'
import kpp from './gears.svg'
import odometer from './odometer.svg'
import { useParams, useNavigate } from 'react-router-dom';
import { getOne, delOne, updateOne } from '../../http/carAPI';
import Loading from '../Loading';
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';


const Car = () => {
    const { id } = useParams()
    const [car, setCar] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const navigate = useNavigate()
    const { user } = useContext(AppContext)
    useEffect(() => {
        getOne(id)
          .then(responseData => {
            if (!responseData) {
                navigate('/cars', { replace: true })
            }
            setCar(responseData)
          })
          .catch(error => {
            console.log('Error fetching data:', error)
          })
      }, [id, navigate])

    
    const handleDelete = async(event) => {
      try {
        const data = await delOne(id)
        if (data) {
          alert('Автомобиль удален из каталога')
          navigate('/cars', { replace: true })
        }
      } catch (e) {
        console.log(e)
        alert('Ошибка при удалении')
      }
    }

    const handleChange = async(event) => {
      setIsEditing(!isEditing)
    }
    
    const changePrice = async(event) => {
      try {
        let data = {}
        data['id'] = id
        data['price'] = event.target.newprice.value.trim()
        const newCar = await updateOne(data)
        if (newCar) {
          window.location.reload()
        }
      } catch (e) {
        alert('Ошибка при изменении цены')
        console.log(e)
      }
    }

    const handleScrollToTop = () => {
      window.scrollTo({
        top: 0
      })
    }

    if (!car) {
        return <Loading/>
    }
    let fuelLower = car.engine.split(', ')[1]
    let fuel = fuelLower.charAt(0).toUpperCase() + fuelLower.slice(1)
  return (
    <section id={classes.car}>
      <div className={classes.carfull}>
        <div className={classes.carimg}>
            <img src={car.img} alt={car.name + " photo"} border="0"/>
        </div>
        <div className={classes.carspecs}></div>
        <Accordion style={{
            width: "100%",
            background: "linear-gradient(90deg, rgba(102,99,159,0.5999649859943977) 0%, rgba(72,72,156,0.5383403361344538) 64%, rgba(10,47,205,0.5999649859943977) 100%)",
            fontFamily: "Georgia, serif"}}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
            <Typography><b>Общая информация</b></Typography>
            </AccordionSummary>
            <AccordionDetails>
            <Typography>
                <p>Производитель: {car.brand}</p>
                <p>Год выпуска: {car.year}</p>
                <p>Цвет: {car.color}</p>
                <p>Комплектация: {car.configuration}</p>
                <p>Пробег: {car.mileage} км</p>
            </Typography>
            </AccordionDetails>
        </Accordion>
        <Accordion style={{
            width: "100%",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            background: "linear-gradient(90deg, rgba(102,99,159,0.5999649859943977) 0%, rgba(72,72,156,0.5383403361344538) 64%, rgba(10,47,205,0.5999649859943977) 100%)",
            fontFamily: "Georgia, serif"}}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
            >
            <Typography><b>Технические характеристики</b></Typography>
            </AccordionSummary>
            <AccordionDetails>
            <Typography>
                <p>Объем двигателя: {car.engine.split(', ')[0]}</p>
                <p>Мощность двигателя: {car.engine.split(', ')[2]}</p>
                <p>Топливо: {fuel}</p>
                <p>Тип кузова: {car.body}</p>
                <p>Трансмиссия: {car.transmission}</p>
            </Typography>
            </AccordionDetails>
        </Accordion>
      </div>
      <div className={classes.carinfo}>
        {(isEditing && user.isAdmin) ? (<i id={classes.deletebutton} className='fa fa-trash' onClick={handleDelete}></i>) : ("")}
        {user.isAdmin ? (
          <i id={classes.editbutton} className='fa fa-edit' onClick={handleChange}></i>
        ) : ("")}
        <h3>{car.brand} {car.name}</h3>
        <h4>{car.configuration}</h4>
        <div className={classes.infoimgs}>
            <div className={classes.carinfoimg}>
                <img alt="engine" src={engine}></img>
                <p>{car.engine}</p>
            </div>
            <div className={classes.carinfoimg}>
                <img alt="odometer" src={odometer}></img>
                <p>{car.mileage} км</p>
            </div>
            <div className={classes.carinfoimg}>
                <img alt="body" src={bodytype}></img>
                <p>{car.body}</p>
            </div>
            <div className={classes.carinfoimg}>
                <img alt="kpp" src={kpp}></img>
                <p>{car.transmission}</p>
            </div>
        </div>
        {(user.isAdmin && isEditing) ? (
          <form onSubmit={changePrice}>
            <input name="newprice" type="text" placeholder='Введите новую цену' required/>
            <button type='submit'>Изменить цену</button>
          </form>
        ) : (<h3 className={classes.carprice}>{car.price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽</h3>)}
        {user.isAuth ? 
        (
          <Link onClick={handleScrollToTop} to='/user'>Получить предложение</Link>
          ) : (
          <Link onClick={handleScrollToTop} to='/login'>Получить предложение</Link>
        )}
        
      </div>
    </section>
  );
};

export default Car;