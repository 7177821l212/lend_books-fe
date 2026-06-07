const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package.json "exports" field resolution to prevent Metro from
// picking up ESM (.mjs) files that use import.meta, which Hermes/web doesn't support.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
