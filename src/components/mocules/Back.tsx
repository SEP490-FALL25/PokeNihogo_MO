import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

type BackScreenProps = {
  color?: string
  onPress?: () => void
  noWrapper?: boolean
}

const BackScreen: React.FC<BackScreenProps> = ({ color = '#111827', onPress, noWrapper }) => {
  const Button = (
    <TouchableOpacity
      accessibilityLabel="Go back"
      className="p-2"
      onPress={onPress ?? (() => router.back())}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ArrowLeft size={22} color={color} />
    </TouchableOpacity>
  )

  if (noWrapper) return Button

  return (
    <View className="flex-row items-center px-5 py-3">
      {Button}
    </View>
  )
}

export default BackScreen

// no styles