import { authInstance } from './axios'


export const addFiles = async (data) => {
    try {
        const response = await authInstance.post('file/add', data, {
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

export const getAllBrands = async () => {
    try {
        const response = await authInstance.get('brand/getall')
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const delBrand = async (name) => {
    try {
        const response = await authInstance.delete(`brand/${name}`)
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const editBrand = async (data) => {
    try {
        const name = data.get('name')
        const response = await authInstance.patch(`brand/${name}`, data, {
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