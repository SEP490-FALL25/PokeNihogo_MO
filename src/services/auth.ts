import { axiosClient } from "@configs/axios"

const authService = {
    login: async (data: any) => {
        return axiosClient.post('/auth/login', data)
    },
    // mock API for setting user level
    setUserLevel: async (level: 'N5' | 'N4' | 'N3') => {
        // mock: simulate network latency
        await new Promise(res => setTimeout(res, 300))
        return { data: { level } }
    },
    // mock API: select a starter pokemon
    selectStarter: async (pokemonId: string) => {
        await new Promise(res => setTimeout(res, 300))
        return { data: { pokemonId } }
    },
}

export default authService