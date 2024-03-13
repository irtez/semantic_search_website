import { guestInstance, authInstance } from './axios'
import jwtDecode from 'jwt-decode'

export const register = async (email, name, phone, password) => {
    try {
        const response = await guestInstance.post('auth/register', {email, name, phone, password})
        const token = response.data.token
        const user = jwtDecode(token)
        localStorage.setItem('token', token)
        return user
    } catch (e) {
        alert(e.response.data.message)
        return false
    }
}

export const login = async (email, password) => {
    try {
        const response = await guestInstance.post('auth/login', {email, password})
        const token = response.data.token
        const user = jwtDecode(token)
        localStorage.setItem('token', token)
        return user
    } catch (e) {
        alert(e.response.data.message)
        return false
    }
}

export const logout = () => {
    localStorage.removeItem('token')
}

export const check = async () => {
    let userData
    try {
        let userToken = localStorage.getItem('token')
        if (!userToken) {
            return false
        }
        const response = await authInstance.get('auth/check')
        userToken = response.data.token
        userData = jwtDecode(userToken)
        localStorage.setItem('token', userToken)
        return userData
    } catch(e) {
        localStorage.removeItem('token')
        return false
    }
}

export const getMe = async () => {
    try {
        const user = await authInstance.get('auth/getme')
        return user
    } catch (e) {
        alert(e.response.data.message)
        
    }       
}

export const updateUser = async (newData) => {
    try {
        //console.log('userapi', field, value)
        const newUser = await authInstance.patch('auth/updateuser', {newData})
        return newUser.data.changed
    } catch (e) {
        alert(e.response.data.message)
        console.log(e)
    }
}