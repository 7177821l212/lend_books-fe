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
    plugins: [
      'expo-secure-store',
      'expo-updates',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'LendBook uses your location while the app is open so your investor can see where you are during collections.',
        },
      ],
    ],
    updates: {
      url: 'https://u.expo.dev/3f903d78-9a29-46c5-8b24-70e7a1e46269',
    },
    extra: {
      eas: {
        projectId: '3f903d78-9a29-46c5-8b24-70e7a1e46269',
      },
      apiUrl:
        process.env.API_URL ??
        (process.env.EAS_BUILD || process.env.NODE_ENV === 'production'
          ? 'https://lendbook-be-753aak7uga-el.a.run.app/api/v1'
          : 'http://localhost:8000/api/v1'),
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};
