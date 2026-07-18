This is an [**Expo**](https://expo.dev) project, converted from a bare React Native CLI app.

# Getting Started

## Step 1: Install dependencies

```sh
npm install
```

Then let Expo align every native package to versions that match your installed SDK:

```sh
npx expo install --fix
```

## Step 2: Start the dev server

```sh
npx expo start
```

This opens Metro's dev tools in your browser. From there you can:

- Press `a` to open on a connected Android device/emulator
- Press `i` to open on the iOS Simulator (macOS only)
- Press `w` to open in a web browser
- Scan the QR code with the **Expo Go** app on a physical device

## Step 3: Modify your app

Open `App.tsx` and start editing — changes reload automatically via Fast Refresh.

## Building native binaries

This project uses the Expo managed workflow, so there are no `ios/` or `android/` folders checked into source control. When you're ready to build an installable app (rather than run inside Expo Go), use [EAS Build](https://docs.expo.dev/build/introduction/):

```sh
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

If you need direct access to the native Xcode/Android Studio projects, run:

```sh
npx expo prebuild
```

## Learn More

- [Expo documentation](https://docs.expo.dev) — guides and API reference
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based navigation, if you want to migrate off React Navigation later
- [EAS Build](https://docs.expo.dev/build/introduction/) — cloud builds for iOS and Android
- [Upgrading the Expo SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
