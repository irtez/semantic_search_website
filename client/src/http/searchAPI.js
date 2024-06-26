import { guestInstance } from './axios'

export const searchDocs = async (searchQuery, searchType) => {
    try {
        const response = await guestInstance.get(`search/${searchType}`, {params: {
            'query': searchQuery
        }})
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

export const getSimilarDocs = async (id) => {
    try {
        const response = await guestInstance.get(`search/${id}`)
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}

