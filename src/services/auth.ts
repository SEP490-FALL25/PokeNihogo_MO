import { axiosClient } from "@configs/axios"
import { ICreateAccountFormDataRequest, ILoginFormDataRequest, IOtpFormDataRequest } from "@models/user/user.request"

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
    login: async (data: ILoginFormDataRequest) => {
        return axiosClient.post('/auth/login', data)
    },
    register: async (data: ICreateAccountFormDataRequest) => {
        return axiosClient.post(`/auth/register`, data)
    },
    forgotPassword: async ({ email }: { email: string }) => {
        return axiosClient.post(`/auth/forgot-password`, { email })
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