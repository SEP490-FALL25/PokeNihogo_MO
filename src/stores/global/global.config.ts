import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createGlobalSlice } from './global.slices'


export const useGlobalStore = create<ZUSTAND.IGlobalState>()(
    devtools(
        (set, get, api) => ({
            ...createGlobalSlice(set, get),
        }),
    )
)