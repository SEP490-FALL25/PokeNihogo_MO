import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createUserSlice } from './user.slices'
import { ZUSTAND } from '../../types/IZustand'


export const useUserStore = create<ZUSTAND.IUserState>()(
    devtools(
        (set, get, api) => ({
            ...createUserSlice(set),
        }),
    )
)