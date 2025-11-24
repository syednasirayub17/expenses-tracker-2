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
  }
};

export default config;
