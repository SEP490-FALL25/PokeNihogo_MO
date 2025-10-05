import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  pokemonName: string;
}

const { width } = Dimensions.get('window');

export default function WelcomeModal({ visible, onClose, username, pokemonName }: WelcomeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#dbeafe', '#ffffff', '#e0e7ff']}
            style={styles.gradientContainer}
          >
            <View style={styles.content}>
              {/* Welcome Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🎉</Text>
              </View>

              {/* Welcome Message */}
              <Text style={styles.title}>Welcome!</Text>
              
              <Text style={styles.message}>
                Welcome, <Text style={styles.username}>{username}</Text>! {'\n'}
                <Text style={styles.pokemonName}>{pokemonName}</Text> is ready to join you on your journey.
              </Text>

              {/* Pokemon Animation Placeholder */}
              <View style={styles.pokemonContainer}>
                <Text style={styles.pokemonEmoji}>🎮</Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Let&apos;s Start! 🚀</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000, // Higher than interaction blocker
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientContainer: {
    padding: 0,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  username: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  pokemonName: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  pokemonContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  pokemonEmoji: {
    fontSize: 50,
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
