import axios from 'axios'

const guestInstance = axios.create({
    baseURL: 'https://car-dealer-server-aw8r.onrender.com'
})

const authInstance = axios.create({
    baseURL: 'https://car-dealer-server-aw8r.onrender.com'
})


const authInterceptor = (config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.authorization = 'Bearer ' + localStorage.getItem('token')
    }
    return config
}
authInstance.interceptors.request.use(authInterceptor)

export {
    guestInstance,
    authInstance
}