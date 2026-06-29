# Tasbeeh 📿

A beautiful Islamic dhikr counter app built with React Native (Expo).

## Features

- **Tap-to-count** dhikr with animated progress ring
- **3 Categories**: Tasbeeh, Darood, and Ayat (Quranic verses)
- **49+ built-in dhikr** entries with Arabic text, transliteration, translation, and virtue
- **Add custom dhikr** with auto-suggestions — can't find what you need? Add your own
- **Start counting immediately** from the custom add screen
- **Auto-save count** — your progress is saved and restored across app restarts
- **See what you're reading** — toggle Arabic, transliteration, and translation visibility
- **Reset options** — quick reset count or full reset with confirmation
- **Haptic feedback** on every tap and cycle completion
- **Keep awake** — screen stays on during dhikr
- **Beautiful dark UI** with gradients, glassmorphism, and category-specific color themes

## Tech Stack

- React Native (Expo SDK 56)
- Expo Linear Gradient
- Expo Haptics
- Expo Keep Awake
- AsyncStorage for persistence
- Native Android project (Gradle)

## Getting Started

```bash
cd tashbee-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** (available on App Store / Play Store).

## Build Android APK

```bash
cd android
./gradlew assembleDebug
```

APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

## GitHub Actions

The repo includes a GitHub Actions workflow that builds a debug APK on every push — no EAS required.

## Project Structure

```
tashbee-app/
├── App.js                    # Main app with navigation
├── src/
│   ├── data/dhikr.js         # All dhikr data + suggestion pool
│   ├── theme.js              # Colors and gradients
│   ├── utils/storage.js      # AsyncStorage helpers
│   └── components/
│       ├── HomeScreen.js     # Category selection
│       ├── SelectorScreen.js # Dhikr list + add custom button
│       ├── CounterScreen.js  # Main counter with auto-save
│       ├── AddCustomScreen.js# Custom dhikr form with suggestions
│       └── ProgressRing.js   # Animated progress ring
├── android/                  # Native Android project
└── .github/workflows/        # CI/CD
```

## License

MIT
