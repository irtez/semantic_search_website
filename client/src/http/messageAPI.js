import { authInstance } from "./axios"

export const createMessage = async (data) => {
    try {
        const response = await authInstance.post('message/create', data)
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const getAllUser = async (status) => {
    try {
        const response = await authInstance.get(`message/getalluser/${status}`)
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const getAllAdmin = async (status) => {
    try {
        const response = await authInstance.get(`message/getalladmin/${status}`)
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const changeStatus = async (data) => {
    try {
        const id = data.id
        const status = data.status
        const response = await authInstance.patch(`message/${id}`, {status})
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}
