# Arabian Transformers - NFC & QR Mobile App

Standalone React Native & Expo mobile application for managing employee business cards and programming physical NFC cards with live digital business cards.

---

## 🚀 How to Run the App

1. Open your terminal in this folder:
   `ash
   cd d:\website\React Website\qrcode-mobile
   `

2. Start the Expo development server:
   `ash
   npm start
   `

3. **How to Preview & Test**:
   * **On your iPhone (iPhone 17 Pro Max) or Android**:
     - Install the free **Expo Go** app from the App Store or Google Play.
     - Scan the large QR code displayed in your terminal with your phone's camera.
     - The app will load onto your phone immediately with Fast Refresh!
   * **In your Computer Browser**:
     - Press **w** in the terminal to launch the mobile viewport in your browser.
   * **On Android Studio Emulator**:
     - Press **** in the terminal.

---

## 📱 Features

1. **Authentication**:
   - Secure login connected to https://QR.arabiantransformers.cloud/api/auth/login.
   - Token stored locally with @react-native-async-storage/async-storage.

2. **Employee Directory**:
   - Live employee cards fetched directly from the VPS database (/api/employees).
   - Real-time search by name, position, email, or phone.
   - Pull-to-refresh to fetch new cards from the server.
   - One-tap phone calling and email composing.

3. **NFC Card Programmer**:
   - Native Apple CoreNFC integration for iOS (eact-native-nfc-manager).
   - One-tap **Write to NFC Card**: Triggers Apple's native iOS NFC scanning sheet.
   - **Erase / Format Card**: Wipes physical cards back to factory blank.

4. **NFC Card Scanner**:
   - Tap any card to the phone to inspect the NDEF link recorded on the microchip.

---

## 🔒 Production API Endpoint
Connected to:
https://QR.arabiantransformers.cloud/api
