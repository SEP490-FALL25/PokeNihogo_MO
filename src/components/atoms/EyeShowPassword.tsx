import { Eye, EyeOff } from 'lucide-react-native'
import React from 'react'

const EyeShowPassword = ({ showPassword, size, color }: { showPassword: boolean, size: number, color: string }) => {
    return (
        <>
            {!showPassword ? (
                <EyeOff size={size} color={color} />
            ) : (
                <Eye size={size} color={color} />
            )}
        </>
    )
}

export default EyeShowPassword