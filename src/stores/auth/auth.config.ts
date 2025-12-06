import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createAuthSlice } from './auth.slices'

export const useAuthStore = create<ZUSTAND.IAuthState>()(
    devtools(
        (set, get, api) => ({
            ...createAuthSlice(set),
        }),
    )
)