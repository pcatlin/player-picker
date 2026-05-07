# PlayerPicker

PlayerPicker is a simple, playful React Native app (Expo) for board games.

Everyone places one finger on the screen and holds for 5 seconds. If all touches stay active, the app randomly chooses one player.

## Features

- Multi-touch tracking with one circle per finger
- Live circle movement that follows each finger
- Configurable player colors in settings
- 5-second hold countdown
- Winner reveal animation:
  - winner colour expands to fill the screen
  - losing circles disappear
  - white marker shows the chosen touch
- Optional haptics toggle

## Tech Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- `expo-haptics`

## Requirements

- Node.js 20+ (recommended: latest LTS)
- npm 10+
- Xcode (for iOS Simulator builds on macOS)
- Android Studio (for Android Emulator builds)

> Note: Expo SDK 54 tooling relies on modern Node features. Node 18 may fail at runtime with Metro errors.

## Install

```bash
npm install
```

## Run Locally

Start Expo:

```bash
npm run start
```

Open a target platform:

```bash
npm run ios
npm run android
```

## How To Use

1. Launch the app.
2. Have at least 2 players place and hold one finger on the screen.
3. Keep all fingers down for 5 seconds.
4. Watch the winner reveal animation.
5. Tap **Play Again** to start another round.

## Testing

### 1) Static checks

```bash
npx tsc --noEmit
```

### 2) Automated tests

Run all unit tests:

```bash
npm test
```

Current test coverage includes:
- RevenueCat service init/purchase/restore behaviors
- App settings persistence (haptics, colors, unlock state)
- Purchase gating outcomes (success/cancel/restore paths)

### 3) Manual QA checklist

- With 0-1 touches: countdown does not start
- With 2+ touches: countdown starts and updates
- If any player lifts finger early: round resets
- Circles follow moving fingers smoothly
- Circle hues are distinct and match chosen colours in settings
- Winner is selected only after full 5 seconds
- Winner fill expands from selected touch point
- White winner marker appears on chosen touch location
- Haptics toggle correctly enables/disables haptic feedback

### 4) Purchase flow testing (RevenueCat)

To test in-app purchases, use a dev build (not Expo Go):

```bash
npm run eas:build:ios:development
npm run eas:build:android:development
```

Required env vars for builds:
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`

RevenueCat setup notes:
- Entitlement ID must be `more_players`
- Ensure your current offering includes a package mapped to that entitlement
- Restore flow should unlock users who previously purchased

Sandbox testing notes:
- iOS: sign in with a Sandbox Apple account on device
- Android: use a Play test account and internal testing track
- If unlock fails, verify API keys, entitlement ID, offering/package mapping, and bundle/package IDs

## Build and Deploy

This app is ready to be packaged with EAS Build for App Store and Google Play.

### 1) Install EAS CLI

```bash
npm install -g eas-cli
```

### 2) Log in to Expo

```bash
eas login
```

### 3) Configure EAS in this project

```bash
eas build:configure
```

### 4) Create production builds

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 5) Submit to stores (optional via CLI)

```bash
eas submit --platform ios
eas submit --platform android
```

## Store Assets

Use the following assets for your listings:

- App icon (1024x1024)
- iOS screenshots (portrait, multiple devices)
- Android screenshots (phone portrait)
- Optional feature graphic for Google Play

If needed, place generated assets under a folder like `store-assets/` and keep source prompt notes for repeatable updates.

## Troubleshooting

- If Expo commands fail with `toReversed is not a function`, upgrade Node to 20+.
- If simulators are not detected, open Xcode/Android Studio once to finish first-time setup.
- If haptics do not fire, verify on a physical device (simulators often do not support full haptics).

## License

Coming soon