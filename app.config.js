module.exports = {
  expo: {
    name: 'LendBook',
    slug: 'lendbook',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'lendbook',
    userInterfaceStyle: 'light',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'ai.genworx.lendbook',
      icon: './assets/icon.png',
    },
    android: {
      package: 'ai.genworx.lendbook',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#16a34a',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-secure-store'],
    extra: {
      // `apiUrl` MUST be set explicitly for any non-dev build.
      // In production we leave it `null` and let the runtime crash loudly rather
      // than silently default to a localhost URL that mobile devices can't reach.
      apiUrl:
        process.env.API_URL ??
        (process.env.EAS_BUILD || process.env.NODE_ENV === 'production'
          ? null
          : 'http://localhost:8000/api/v1'),
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};
