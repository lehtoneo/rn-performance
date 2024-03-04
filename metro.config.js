const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'bin'
);

config.resolver.assetExts.push('tflite');
config.resolver.assetExts.push('onnx');

module.exports = config;
