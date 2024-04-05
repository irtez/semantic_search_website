import { guestInstance } from './axios'

export const searchText = async (searchQuery) => {
    try {
        const response = await guestInstance.get(`search/text`, {params: {
            'query': searchQuery
        }})
        return response
    } catch (e) {
        console.log(e.response.data.message)
        alert(e.response.data.message)
    }
}