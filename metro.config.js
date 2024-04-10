const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('bin');

config.resolver.assetExts.push('tflite');
config.resolver.assetExts.push('onnx');
config.resolver.assetExts.push('ort');

module.exports = config;
