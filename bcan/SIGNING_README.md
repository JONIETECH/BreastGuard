# Flutter App Release & Signing Guide

This guide details how to configure app signing, build release binaries, and prepare your Flutter app for upload to the Google Play Store and Apple App Store.

---

## 🤖 Android Release Signing

We have updated the Gradle build configuration (`android/app/build.gradle.kts`) to automatically sign the app if a `key.properties` file is present in the `android/` directory. If it is not present, it safely falls back to debug signing so local builds continue to function without issues.

### Step 1: Generate a Keystore File

To sign your app for production/upload, you need a Java Keystore (`.jks` file). You can generate one using the `keytool` utility.

#### Windows
Run the following command in PowerShell or Command Prompt. If `keytool` is not found, you can find it under your JDK path or Android Studio's JRE path (e.g., `C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe`):

```powershell
keytool -genkey -v -keystore upload-keystore.jks -storetype RSA -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

#### macOS / Linux
Run the following command in your terminal:

```bash
keytool -genkey -v -keystore upload-keystore.jks -keeprstore RSA -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

*Note: Save this keystore file as `upload-keystore.jks` inside the `android/` folder (or at the root, but make sure to refer to its path correctly in `key.properties`).*

> [!WARNING]
> Keep your keystore secure! If you lose the keystore or passwords used to sign the app, you will not be able to push updates to the Play Store.

---

### Step 2: Configure `key.properties`

1. Go to the `android/` directory.
2. Copy the template `key.properties.template` and name the copy `key.properties`:
   ```bash
   cp key.properties.template key.properties
   ```
3. Open `android/key.properties` and replace the placeholder values with your keystore credentials:
   ```properties
   storePassword=your_keystore_password_here
   keyPassword=your_key_password_here
   keyAlias=upload
   storeFile=../upload-keystore.jks
   ```
   *Note: `storeFile` is set relative to the `android/app` directory. If you saved `upload-keystore.jks` inside `android/` directory, the relative path `../upload-keystore.jks` is correct.*

> [!IMPORTANT]
> Both `key.properties` and `.jks` files are ignored by git in `android/.gitignore` by default. **Never commit these files to your version control repository.**

---

### Step 3: Build the Android App

Once the configuration is in place, you can build your production release.

#### Build an App Bundle (Recommended for Google Play Store)
Google Play requires App Bundles (`.aab`) instead of APKs for new apps. This reduces download sizes for your users:
```bash
flutter build appbundle --release
```

#### Build a Release APK (For manual distribution/testing)
If you need to share a standalone APK:
```bash
flutter build apk --release
```

---

## 🍏 iOS Release Signing

iOS app signing is handled through Xcode.

### Step 1: Set up Apple Developer Program
To upload an app to the App Store, you need an active [Apple Developer Account](https://developer.apple.com/).

### Step 2: Open in Xcode
1. Open the project's iOS workspace in Xcode:
   ```bash
   open ios/Runner.xcworkspace
   ```
2. In the project navigator, select the `Runner` target.
3. Select the **Signing & Capabilities** tab.
4. Check **Automatically manage signing**.
5. Select your development team from the **Team** dropdown menu.
6. Xcode will automatically generate provisioning profiles and signing certificates.

### Step 3: Build & Archive
To create an archive ready for upload to App Store Connect / TestFlight:
```bash
flutter build ipa --release
```
Then, upload the generated `.ipa` archive via Xcode Organizer or the Transporter app.

---

## 🚀 Pre-upload Checklist

Before building your app for upload:

1. **Verify Version Numbers (`pubspec.yaml`)**:
   Update `version: 1.0.0+1`. The number before the `+` is the user-visible version (e.g. `1.0.0`), and the number after the `+` is the build code/number (e.g. `1` for the first upload, `2` for the second, etc.).
   Every build uploaded to the app stores must have a unique build number.
   
2. **Review Application IDs**:
   - Android Application ID is configured in `android/app/build.gradle.kts` (currently `com.bcanscan.jonietech`).
   - iOS Bundle Identifier is configured in Xcode.

3. **Check Launcher Icons & Assets**:
   Make sure you have set the launcher icons for the app. The app has `flutter_launcher_icons.yaml` configured, you can generate/update the icons by running:
   ```bash
   flutter pub run flutter_launcher_icons
   ```

4. **Verify Environment Configuration**:
   Ensure your production API URLs, keys, and values are set correctly in your environment variables/`.env` file.
