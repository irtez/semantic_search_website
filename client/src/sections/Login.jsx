import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './styles/LogReg.css'
import { useContext } from 'react'
import { AppContext } from '../routes/AppContext'
import { observer } from 'mobx-react-lite'
import { login } from '../http/userAPI'
import { useState } from 'react'
import Loading from './Loading'


const Login = observer(() => {
  const {user} = useContext(AppContext)
  const navigate = useNavigate()
  if (user.isAuth) navigate('/user', {replace: true})
  if (user.isAdmin) navigate('/admin', {replace: true})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    const email = event.target.email.value.trim()
    const password = event.target.password.value.trim()
    const data = await login(email, password)
    if (data) {
      user.login(data)
      if (user.isAuth) navigate('/user')
      if (user.isAdmin) navigate('/admin')
    }
    setIsLoading(false)
  }
  const [password, setPassword] = useState(null)
  const [email, setEmail] = useState(null)

  function handleEmailChange(event) {
    setEmail(event.target.value)
  }
  function handlePasswordChange(event) {
    setPassword(event.target.value)
  }

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0
    });
  };

  if (isLoading) {
    return <Loading/>
  }

  return (
    <section id="login">
      <div className="screen">
        <div className="screen__content">
          <form className="login" onSubmit={handleSubmit}>
            <div className="login__field">
              <i className="login__icon fa fa-envelope"></i>
              <input name="email" type="text" className="login__input" onChange={handleEmailChange} placeholder="E-mail"/>
            </div>
            <div className="login__field">
              <i className="login__icon fa fa-lock"></i>
              <input name="password" type="password" className="login__input" onChange={handlePasswordChange} placeholder="Пароль"/>
            </div>
            <button className="button login__submit" disabled={!(email && password)}>
              <span className="button__text">Войти</span>
            </button>
            <div className='popup' style={{display: !(email&&password) ? ("block") : ("none")}}>
              Заполните все поля
            </div>			
            	
          </form>
          <div className='register_container'>
            <Link onClick={handleScrollToTop} to='/register' className="register">
              <span className="button__text">Зарегистрироваться</span>
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
  )
})

export default Login