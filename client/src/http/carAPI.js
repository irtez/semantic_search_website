import { authInstance, guestInstance } from "./axios"

export const createCar = async (data) => {
    try {
        const response = await authInstance.post('car/create', data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const getAllCars = async () => {
    try {
        const response = await guestInstance.get('car/getall')
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const getOne = async (carid) => {
    try {
        const response = await guestInstance.get(`car/${carid}`)
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        return false
    }
}

export const delOne = async(carid) => {
    try {
        const response = await authInstance.delete(`car/${carid}`)
        return response.data
    } catch (e) {
        console.log(e.reponse.data.message)
        return false
    }
}

export const updateOne = async(data) => {
    try {
        const carid = data.id
        const price = data.price
        const response = await authInstance.patch(`car/${carid}`, {price})
        return response.data
    } catch(e) {
        console.log(e.reponse.data.message)
        return false
    }
}