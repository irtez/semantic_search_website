import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/sections.css'
import './styles/LogReg.css'
import { useContext, useState } from 'react';
import { AppContext } from '../routes/AppContext';
import { observer } from 'mobx-react-lite'
import { register } from '../http/userAPI'
import Loading from './Loading';

const Register = observer(() => {

  const {user} = useContext(AppContext);
  const navigate = useNavigate();
  if (user.isAuth) navigate('/user', {replace: true})
  if (user.isAdmin) navigate('/admin', {replace: true})
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true)
    const data = await register(email, name, pass1)
    if (data) {
      user.login(data)
      if (user.isAdmin) navigate('/admin')
      if (user.isAuth) navigate('/user')
    }
    

  }


  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [email, setEmail] = useState(null)
  const [name, setName] = useState(null)



  function handlePass1Change(event) {
    setPass1(event.target.value)
  }

  function handlePass2Change(event) {
    setPass2(event.target.value)
  }

  function handleNameChange(event) {
    setName(event.target.value)
  }

  function handleEmailChange(event) {
    setEmail(event.target.value)
  }

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (isLoading) {
    return <Loading/>
  }

  return (
    <section id="register">
      <div className="screen">
        <div className="screen__content">
          <form className="login" onSubmit={handleSubmit}>
            <div className="login__field">
              <i className="login__icon fa fa-envelope"></i>
              <input name="email" type="text" className="login__input" onChange={handleEmailChange} placeholder="E-mail" required={true}/>
            </div>
            <div className="login__field">
              <i className="login__icon fa fa-user"></i>
              <input name="name" type="text" className="login__input" onChange={handleNameChange} placeholder="Имя" required={true}/>
            </div>
            {/* <div className="login__field">
              <i className="login__icon fa fa-phone"></i>
              <input name="phone" type="text" className="login__input" placeholder="Номер телефона" onChange={handlePhoneChange} value={phoneNumber} required={true}/>
            </div> */}
            <div className="login__field">
              <i className="login__icon fa fa-lock"></i>
              <input name="password" type="password" className="login__input" onChange={handlePass1Change} placeholder="Пароль" required={true}/>
            </div>
            <div className="login__field">
              <i className="login__icon fa fa-lock"></i>
              <input name="pass2" type="password" className="login__input" onChange={handlePass2Change} placeholder="Подтвердите пароль"/>
              {(pass1 === pass2) ? ("") : (<p style={{color: "red", fontSize: "14px", marginTop: "5px", position: "absolute"}}>Пароли не совпадают</p>)}
            </div>
            <button type="submit" className="button login__submit" disabled={!((pass1 === pass2) && pass1 && pass2 && email && name)}>
              <span className="button__text">Зарегистрироваться</span>
            </button>			
            <div className='popup' style={{display: !(email&&pass1&&pass2&&name) ? ("block") : ("none")}}>
              Заполните все поля
            </div>		
          </form>
          <div className='register_container'>
            <Link onClick={handleScrollToTop} to='/login' className="register">
              <span className="button__text">Вход</span>
              <i className="button__icon fa fa-chevron-right"></i>
            </Link>
          </div>
        </div>
        <div className="screen__background">
          <span className="screen__background__shape screen__background__shape4"></span>
          <span className="screen__background__shape screen__background__shape3"></span>		
          <span className="screen__background__shape screen__background__shape2"></span>
          <span className="screen__background__shape screen__background__shape1"></span>
        </div>		
      </div>
    </section>
  );
});

export default Register;