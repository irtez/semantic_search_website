import React from 'react';
import classes from './Service.module.css'
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../routes/AppContext';

const Service = () => {
  const { user } = useContext(AppContext)
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0
    })
  }
  return (
    <section id={classes.service}>
      <h3>Мы предоставляем следующие виды сервисных работ:</h3>
      <div className={classes.servicecontainer}>
        <div id={classes.tosmotr} className={classes.serviceobject}>
          <p>Технический осмотр</p>
          <p id={classes.stext}>ТС (ГТО)</p>
        </div>
        <div id={classes.tobsl} className={classes.serviceobject}>
        <p>Техническое обслуживание</p>
        </div>
        <div id={classes.gr} className={classes.serviceobject}>
        <p>Гарантийный ремонт</p>
        </div>
        <div id={classes.kr} className={classes.serviceobject}>
        <p>Кузовной ремонт</p>
        </div>
      </div>
      <div className={classes.info}>
        <h5>Более подробно узнавайте по телефону, почте или посетив нас по адресу г. Москва, проспект Вернадского, д. 78.</h5>
        <Link onClick={handleScrollToTop} to='/about'>Контакты</Link>
        <h5>Также Вы можете оставить обращение в личном кабинете и мы Вам перезвоним!</h5>
        {user.isAuth ? (
          <Link onClick={handleScrollToTop} to='/user'>Оставить обращение</Link>
          ) : (
          <Link onClick={handleScrollToTop} to='/login'>Оставить обращение</Link>
        )}
      </div>
    </section>
  );
};

export default Service;