const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Thêm hỗ trợ cho file .lottie
config.resolver.assetExts.push('lottie');

// Cấu hình alias cho Metro resolver
config.resolver.alias = {
  '@assets': path.resolve(__dirname, 'assets'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@models': path.resolve(__dirname, 'src/models'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@stores': path.resolve(__dirname, 'src/stores'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@configs': path.resolve(__dirname, 'src/configs'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@routes': path.resolve(__dirname, 'src/routes'),
};

module.exports = withNativeWind(config, { input: './global.css' })