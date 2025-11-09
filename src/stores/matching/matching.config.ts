import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createMatchingSlice } from './matching.slices'

export const useMatchingStore = create<ZUSTAND.IMatchingState>()(
    devtools(
        (set, get, api) => ({
            ...createMatchingSlice(set),
        }),
        { name: 'MatchingStore' }
    )
)

