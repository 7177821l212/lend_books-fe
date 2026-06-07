module.exports = {
  expo: {
    name: 'LendBook',
    slug: 'lendbook',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'lendbook',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'ai.genworx.lendbook',
    },
    android: {
      package: 'ai.genworx.lendbook',
    },
    plugins: ['expo-secure-store', 'expo-updates'],
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
          ? 'https://lendbook-be-638388576672.asia-south1.run.app/api/v1'
          : 'http://localhost:8000/api/v1'),
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};
