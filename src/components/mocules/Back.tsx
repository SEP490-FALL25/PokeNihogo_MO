import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const BackScreen = () => {
    return (
        <View className="flex-row items-center justify-between px-5 py-4">
            <TouchableOpacity className="p-2" onPress={() => router.back()}>
                <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <View className="w-10" />
        </View>
    )
}

export default BackScreen

const styles = StyleSheet.create({})