import { axiosPrivate } from "@configs/axios"

const pokemonService = {
    getAll: async (currentPage: number = 1, qs: string = 'sort:id,isStarted=true') => {
        return axiosPrivate.get(`/pokemon?qs=${qs}&currentPage=${currentPage}`)
    },
    getById: async (id: string) => {
        return axiosPrivate.get(`/pokemon/${id}`)
    },
}

export default pokemonService