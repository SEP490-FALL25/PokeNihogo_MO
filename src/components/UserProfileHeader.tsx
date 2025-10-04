// components/UserProfileHeaderExpandable.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';


const { width } = Dimensions.get('window');

interface User {
  name: string;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  avatar?: string;
}

interface UserProfileHeaderExpandableProps {
  user: User;
}

export default function UserProfileHeaderExpandable({ user }: UserProfileHeaderExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  const expPercentage = (user.currentExp / user.expToNextLevel) * 100;
  const expRemaining = user.expToNextLevel - user.currentExp;

  const handleOpen = () => {
    setIsExpanded(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsExpanded(false));
  };

  return (
    <>
      {/* Compact Header Bar */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleOpen}
        style={styles.compactBar}
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv {user.level}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${expPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {user.currentExp.toLocaleString()} / {user.expToNextLevel.toLocaleString()} XP
            </Text>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Overlay Modal */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.expandedCard}
              >
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {/* Large Avatar */}
                <View style={styles.largeAvatarContainer}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.largeAvatar} />
                  ) : (
                    <View style={styles.largeAvatarPlaceholder}>
                      <Text style={styles.largeAvatarPlaceholderText}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* User Name */}
                <Text style={styles.userName}>{user.name}</Text>

                {/* Level Badge Large */}
                <View style={styles.levelBadgeLarge}>
                  <Text style={styles.levelTextLarge}>Level {user.level}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {user.currentExp.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Current XP</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {user.expToNextLevel.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Next Level</Text>
                  </View>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Experience Progress</Text>
                    <Text style={styles.progressPercentage}>
                      {expPercentage.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.progressBarLarge}>
                    <View
                      style={[
                        styles.progressBarFillLarge,
                        { width: `${expPercentage}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.remainingText}>
                    {expRemaining.toLocaleString()} XP to Level {user.level + 1}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Compact Bar Styles
  compactBar: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarPlaceholderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  modalContent: {
    marginHorizontal: 16,
  },
  expandedCard: {
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  largeAvatarContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  largeAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  largeAvatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  largeAvatarPlaceholderText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '700',
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  levelBadgeLarge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  levelTextLarge: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarLarge: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFillLarge: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  remainingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});