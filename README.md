# Electronic Gym Notebook

This application is a mobile gym notebook for creating and logging workouts. Utilises Google's MediaPipe to check the user's form in selected exercises, e.g bicep curl and squats. 


## Requirements
- **Gradle**: Minimum SDK 24 or higher
- **Android-SDK**: Version 26 or higher
- **iOS**: 12 or higher
- **Yarn**

---

## Android

### Run Locally
1. **Navigate** to the `GymNotebook` folder.
2. Run `yarn` to install dependencies.
3. Navigate to the `android` folder and run `./gradlew clean`.
4. **Open two terminals**:
   - **Terminal 1**: `yarn start` (starts the Metro bundler)
   - **Terminal 2**: `yarn android` (builds and installs the Android app)

### Create APK
1. Navigate to the `gymnotebook/android` directory.
2. Run `./gradlew assembleDebug` (or the relevant build variant).
3. Find the generated APK in the appropriate build outputs directory (e.g. `app/build/outputs/apk/release`).

---

## iOS

### Info.plist Configuration
In your `Info.plist`, add the following keys in the outermost `<dict>` tag:

```xml
<key>NSCameraUsageDescription</key>
<string>$(PRODUCT_NAME) needs access to your Camera.</string>

<key>NSMicrophoneUsageDescription</key>
<string>$(PRODUCT_NAME) needs access to your Microphone.</string>

```

### Then

1. Navigate to the ios folder.

2. Run bundle install (only required once).

3. Run pod install.
