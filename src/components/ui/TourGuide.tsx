import { useUserStore } from '@stores/user/user.config';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TourGuideProvider, TourGuideZone, useTourGuideController } from 'rn-tourguide';

interface TourGuideProps {
  children: React.ReactNode;
}

interface TourStepProps {
  name: string;
  text: string;
  zone: number;
  children?: React.ReactNode;
}

const TourStep: React.FC<TourStepProps> = ({ name, text, zone, children }) => {
  const { eventEmitter } = useTourGuideController();

  useEffect(() => {
    const handleTourEnd = () => {
      // Update isFirstTimeLogin to false when tour completes
      useUserStore.getState().setIsFirstTimeLogin(false);
    };

    eventEmitter?.on('stop', handleTourEnd);
    return () => eventEmitter?.off('stop', handleTourEnd);
  }, [eventEmitter]);

  return (
    <TourGuideZone
      zone={zone}
      text={text}
      borderRadius={16}
      style={styles.tourZone}
    >
      {children || name}
    </TourGuideZone>
  );
};

const TourGuideWrapper: React.FC<TourGuideProps> = ({ children }) => {
  const { isFirstTimeLogin, starterId, email, showWelcomeModal, setShowWelcomeModal, setIsTourGuideActive, setIsFirstTimeLogin } = useUserStore();
  const [tourStarted, setTourStarted] = useState(false);
  const { start, canStart, eventEmitter } = useTourGuideController();

  // Get Pokemon name from starterId
  const getPokemonName = () => {
    if (!starterId) return 'Your Pokémon';
    // Convert starterId to proper case
    return starterId.charAt(0).toUpperCase() + starterId.slice(1);
  };

  // Get username from email
  const getUsername = () => {
    if (!email) return 'Trainer';
    return email.split('@')[0];
  };

  useEffect(() => {
    if (isFirstTimeLogin && !tourStarted) {
      setShowWelcomeModal(true);
    }
  }, [isFirstTimeLogin, tourStarted, setShowWelcomeModal]);

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    setTourStarted(true);
    // Start the tour after a delay to ensure elements are rendered
    setTimeout(() => {
      if (canStart) {
        setIsTourGuideActive(true);
        // Try starting from zone 1, if it fails, start from beginning
        try {
          start(1); // Start from zone 1 (UserProfileHeader)
        } catch (error) {
          console.log('Zone 1 not ready, starting from beginning');
          start(); // Fallback to start from beginning
        }
      }
    }, 1500); // Increased delay to ensure all elements are rendered
  };

  // Listen to tour guide events
  useEffect(() => {
    if (!eventEmitter) return;

    const handleTourStart = () => {
      setIsTourGuideActive(true);
    };

    const handleTourStop = () => {
      setIsTourGuideActive(false);
      setIsFirstTimeLogin(false);
    };

    eventEmitter.on('start', handleTourStart);
    eventEmitter.on('stop', handleTourStop);

    return () => {
      eventEmitter.off('start', handleTourStart);
      eventEmitter.off('stop', handleTourStop);
    };
  }, [eventEmitter, setIsTourGuideActive, setIsFirstTimeLogin]);

  return (
    <View style={styles.container}>
      {children}
      
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.welcomeModal}>
            <LinearGradient
              colors={['#dbeafe', '#ffffff', '#e0e7ff']}
              style={styles.gradientContainer}
            >
              <View style={styles.modalContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>🎉</Text>
                </View>
                
                <Text style={styles.title}>Welcome!</Text>
                
                <Text style={styles.message}>
                  Welcome, <Text style={styles.username}>{getUsername()}</Text>! {'\n'}
                  <Text style={styles.pokemonName}>{getPokemonName()}</Text> is ready to join you on your journey.
                </Text>

                <View style={styles.pokemonContainer}>
                  <Text style={styles.pokemonEmoji}>🎮</Text>
                </View>

                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={handleWelcomeModalClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Let&apos;s Start! 🚀</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
    </View>
  );
};

const TourGuideProviderWrapper: React.FC<TourGuideProps> = ({ children }) => {
  return (
    <TourGuideProvider
      {...({
        androidStatusBarVisible: true,
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        backdropColor: 'rgba(0, 0, 0, 0.5)',
        tooltipStyle: {
          borderRadius: 16,
          padding: 16,
        },
        labelStyle: {
          color: '#1f2937',
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        },
        maskOffset: 8,
        borderRadius: 16,
        // Ensure tour starts from the first step
        startAtMount: false,
      } as any)}
    >
      <TourGuideWrapper>{children}</TourGuideWrapper>
    </TourGuideProvider>
  );
};

export { TourGuideProviderWrapper as TourGuide, TourStep };
export default TourGuideProviderWrapper;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  welcomeModal: {
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
  modalContent: {
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
  tourZone: {
    padding: 8,
  },
});
