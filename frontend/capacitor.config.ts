import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jianluochat.app',
  appName: 'JianluoChat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://matrix.org',
      'https://*.matrix.org',
      'https://vector.im',
      'https://element.io',
      'https://*.element.io'
    ]
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    CapacitorHttp: {
      enabled: true
    }
  },
};

export default config;
