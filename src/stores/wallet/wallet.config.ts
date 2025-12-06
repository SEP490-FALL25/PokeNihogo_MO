import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createWalletSlice } from './wallet.slices'

export const useWalletStore = create<ZUSTAND.IWalletState>()(
    devtools(
        (set, get, api) => ({
            ...createWalletSlice(set),
        }),
    )
)
