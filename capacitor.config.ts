import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.expenses.tracker',
  appName: 'Expenses Tracker',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'https://expenses-tracker-api-a7ni.onrender.com',
      'https://expenses-tracker-2-one.vercel.app'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#6366F1",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#4F46E5"
    }
  }
};

export default config;
