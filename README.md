# Neurolift (Cognitive Training App)

A scientifically-inspired cognitive training application built with Expo and React Native.

## 🚀 Live Demo
**Web Version**: [https://neurolift-seven.vercel.app](https://neurolift-seven.vercel.app)
*(Note: Some mobile-specific features like haptics may not work on web)*

## 📱 Android App
The app is built for Android. You can build it yourself using EAS or requesting a build from the developer.

## 🛠️ How to Run Locally

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the app**:
    *   Web: `npx expo start --web`
    *   Android: `npx expo run:android` (requires Android Studio) or `npx expo start` (with Expo Go app)

## 📦 Deployment

### Web (Vercel)
The app is configured to deploy via Vercel.
```bash
vercel --prod
```

### Android (EAS)
To build a new APK:
```bash
npx eas-cli build -p android --profile preview
```
To push an update (OTA):
```bash
npx eas-cli update --branch preview --message "Your message"
```
