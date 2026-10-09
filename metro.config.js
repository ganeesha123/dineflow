// Firebase JS SDK + Expo: let Metro resolve firebase's .cjs files and avoid the
// "Component auth has not been registered yet" error with package exports.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
