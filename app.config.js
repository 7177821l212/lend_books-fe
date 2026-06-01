module.exports = {
  expo: {
    name: 'LendBook',
    slug: 'lendbook',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'lendbook',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#7B2FBE',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'ai.genworx.lendbook',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#7B2FBE',
      },
      package: 'ai.genworx.lendbook',
    },
    plugins: ['expo-router', 'expo-secure-store'],
    extra: {
      apiUrl: process.env.API_URL ?? 'http://localhost:8000/api/v1',
      eas: { projectId: '' },
    },
  },
};
