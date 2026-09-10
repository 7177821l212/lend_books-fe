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
      bundleIdentifier: 'com.lendbook.app',
      icon: './assets/icon.png',
    },
    android: {
      package: 'com.lendbook.app',
      permissions: ['VIBRATE'],
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
      url: 'https://u.expo.dev/da5098d4-eb8f-4b2c-8ad9-6a1637c9d887',
    },
    extra: {
      eas: {
        projectId: 'da5098d4-eb8f-4b2c-8ad9-6a1637c9d887',
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
