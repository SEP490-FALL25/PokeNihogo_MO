module.exports = {
    dependencies: {
      'react-native-worklets': {
        platforms: {
          android: null, // 👈 Dòng này bảo Android: "Đừng build gói này!"
          ios: null,     // 👈 Bảo luôn iOS cho chắc
        },
      },
    },
  };