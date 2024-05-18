import { authInstance } from './axios'


export const addDocuments = async (data) => {
    try {
        const response = await authInstance.post('document', data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
        })
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const getOne = async (docId) => {
    try {
        const response = await authInstance.get(`document/${docId}`)
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const downloadOne = async (docId) => {
    try {
        const response = await authInstance.get(`document/download/${docId}`, {
            responseType: 'blob'
        })
        return response
    } catch (e) {
        console.log(e.response.data.message)
    }
}

export const editDocument = async (id, data) => {
    try {
        const response = await authInstance.patch(`document/${id}`, data)
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const deleteDocument = async (id) => {
    try {
        const response = await authInstance.delete(`document/${id}`)
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}