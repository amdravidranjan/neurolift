# Neurolift (Cognitive Training App)

**Neurolift** is an all-rounder **brain training** app designed to give your gray matter a comprehensive workout.

It features a diverse set of cognitive exercises designed for:
1.  **Memory Improvement** (N-Back, Mental Workbench, Working Memory Training)
2.  **Attention Training** (Vigilance, Selective Attention, Focus Improvement)
3.  **Reasoning & Logic** (Pattern Recognition, Abstract Reasoning, Problem Solving)
4.  **Speed Reading & Processing** (RSVP Reading, Reaction Time, rapid visual processing)
5.  **Cognitive Flexibility** (Task Switching, Inhibition Control, Adaptability)

## 🎥 Gameplay Demo
<video src="assets/video/demo2.mp4" controls="controls" style="max-width: 100%;"></video>

My favorite feature is the **RSVP Reading** which helps you read faster. It needs insane amount of focus. (Ofcourse reading is easy, but grasping and processing information at 1000 wpm takes skill.)

> [!NOTE]
> **Project Status:** This app is currently in active development. We are constantly improving the stability and adding new exercises. Feedback is welcome!

## Key Features
*   **Academy Dashboard**: Track your cognitive profile and progress over time.
*   **Baseline Assessment**: Standardized testing to measure your current cognitive performance.
*   **Offline-First**: Train anywhere without needing an internet connection.
*   **Adaptive Difficulty**: Exercises automatically adjust to your skill level for optimal training.

<!-- Tags: #brain-training #memory-improvement #cognitive-science #react-native #expo #focus-training #logic-puzzles #speed-reading #mental-math #self-improvement -->

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
