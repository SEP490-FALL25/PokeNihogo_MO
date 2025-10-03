import { axiosClient } from "@configs/axios"
import { ICreateAccountFormDataRequest, IOtpFormDataRequest } from "@models/user/user.request"

const authService = {
    checkEmail: async (email: string) => {
        return axiosClient.get(`/auth/check-email/${email}`)
    },
    verifyOtp: async (data: IOtpFormDataRequest) => {
        return axiosClient.post(`/auth/verify-otp`, data)
    },
    resendOtp: async (email: string) => {
        return axiosClient.post(`/auth/resend-verified-email/${email}`)
    },
    login: async (data: any) => {
        return axiosClient.post('/auth/login', data)
    },
    register: async (data: ICreateAccountFormDataRequest) => {
        return axiosClient.post(`/auth/register`, data)
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