/**
 * Màn hình demo BottomSheet component
 * 
 * Component này có thể slide từ dưới màn hình lên, dừng lại ở 50% màn hình (có thể tùy chỉnh),
 * và có thể scroll nội dung bên trong nếu nội dung quá nhiều.
 */

import { router } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '../../components/ThemedText'
import {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'

export default function BottomSheetDemoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Button variant="ghost" onPress={() => router.back()}>
            ← Quay lại
          </Button>
          <ThemedText type="title" style={styles.title}>
            BottomSheet Demo
          </ThemedText>
          <ThemedText type="default" style={styles.description}>
            Các ví dụ về cách sử dụng BottomSheet component
          </ThemedText>
        </View>

        <View style={styles.examplesContainer}>
          {/* Ví dụ 1: BottomSheet cơ bản */}
          <View style={styles.exampleSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ví dụ 1: BottomSheet Cơ bản
            </ThemedText>
            <BottomSheet>
              <BottomSheetTrigger>
                <Button>Mở Bottom Sheet</Button>
              </BottomSheetTrigger>
              
              <BottomSheetContent>
                <BottomSheetHeader>
                  <BottomSheetTitle>Tiêu đề Bottom Sheet</BottomSheetTitle>
                  <BottomSheetDescription>
                    Đây là mô tả của bottom sheet. Bạn có thể thêm nội dung ở đây.
                  </BottomSheetDescription>
                </BottomSheetHeader>
                
                <View style={styles.content}>
                  <Text>Nội dung của bottom sheet</Text>
                  <Text>Bạn có thể thêm nhiều nội dung ở đây</Text>
                </View>
                
                <BottomSheetFooter>
                  <BottomSheetClose>
                    <Button variant="outline">Đóng</Button>
                  </BottomSheetClose>
                </BottomSheetFooter>
              </BottomSheetContent>
            </BottomSheet>
          </View>

          {/* Ví dụ 2: BottomSheet với nội dung scrollable dài */}
          <View style={styles.exampleSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ví dụ 2: Nội dung Scrollable Dài
            </ThemedText>
            <BottomSheet>
              <BottomSheetTrigger>
                <Button>Mở Bottom Sheet với Nội dung Dài</Button>
              </BottomSheetTrigger>
              
              <BottomSheetContent>
                <BottomSheetHeader>
                  <BottomSheetTitle>Nội dung Dài</BottomSheetTitle>
                  <BottomSheetDescription>
                    Bottom sheet này có nhiều nội dung và có thể scroll
                  </BottomSheetDescription>
                </BottomSheetHeader>
                
                <View style={styles.scrollableContent}>
                  {Array.from({ length: 50 }, (_, i) => (
                    <View key={i} style={styles.item}>
                      <Text>Item {i + 1}</Text>
                    </View>
                  ))}
                </View>
                
                <BottomSheetFooter>
                  <BottomSheetClose>
                    <Button variant="outline">Đóng</Button>
                  </BottomSheetClose>
                </BottomSheetFooter>
              </BottomSheetContent>
            </BottomSheet>
          </View>

          {/* Ví dụ 3: BottomSheet với snap points tùy chỉnh (75% màn hình) */}
          <View style={styles.exampleSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ví dụ 3: BottomSheet 75% Màn hình
            </ThemedText>
            <BottomSheet>
              <BottomSheetTrigger>
                <Button>Mở Bottom Sheet 75%</Button>
              </BottomSheetTrigger>
              
              <BottomSheetContent snapPoints={[0.75]}>
                <BottomSheetHeader>
                  <BottomSheetTitle>Bottom Sheet 75%</BottomSheetTitle>
                  <BottomSheetDescription>
                    Bottom sheet này chiếm 75% chiều cao màn hình
                  </BottomSheetDescription>
                </BottomSheetHeader>
                
                <View style={styles.content}>
                  <Text>Nội dung của bottom sheet</Text>
                </View>
              </BottomSheetContent>
            </BottomSheet>
          </View>

          {/* Ví dụ 4: BottomSheet không cho phép kéo xuống để đóng */}
          <View style={styles.exampleSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ví dụ 4: Không thể Kéo để Đóng
            </ThemedText>
            <BottomSheet>
              <BottomSheetTrigger>
                <Button>Mở Bottom Sheet (Không thể kéo)</Button>
              </BottomSheetTrigger>
              
              <BottomSheetContent enablePanDownToClose={false}>
                <BottomSheetHeader>
                  <BottomSheetTitle>Bottom Sheet Không thể Kéo</BottomSheetTitle>
                  <BottomSheetDescription>
                    Bottom sheet này không thể kéo xuống để đóng, chỉ có thể đóng bằng nút
                  </BottomSheetDescription>
                </BottomSheetHeader>
                
                <View style={styles.content}>
                  <Text>Chỉ có thể đóng bằng cách nhấn backdrop hoặc nút đóng</Text>
                </View>
                
                <BottomSheetFooter>
                  <BottomSheetClose>
                    <Button variant="outline">Đóng</Button>
                  </BottomSheetClose>
                </BottomSheetFooter>
              </BottomSheetContent>
            </BottomSheet>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  examplesContainer: {
    gap: 24,
  },
  exampleSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  scrollableContent: {
    gap: 8,
  },
  item: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
  },
})

