import { authInstance } from "./axios"

export const createCollection = async (data) => {
    try {
        const response = await authInstance.post('collection', data)
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const getCollections = async () => {
    try {
        const response = await authInstance.get('collection')
        return response.data
    } catch (e) {
        console.log(e.response.data.message)
        //alert(e.response.data.message)
    }
}


export const editCollection = async (data) => {
    try {
        const response = await authInstance.patch(
            `collection/${data.collectionId}`,
            {
                add: data.add,
                delete: data.delete
            }
        )
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const deleteCollection = async (collectionId) => {
    try {
        const response = await authInstance.delete(`collection/${collectionId}`)
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}