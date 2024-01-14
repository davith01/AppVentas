# AppVenta

This project uses the [Ionic](https://ionicframework.com/docs/intro) Framework components for apps Android .

## Quick start


**Installation prerequisites**

Please make sure latest [Node](https://nodejs.org/es/), [Git](https://git-scm.com/downloads) and [Yarn](https://yarnpkg.com/lang/en/docs/install/) package are installed


**Install Framework**

Install or rebuild last component to Node and IONIC.
```
npm install -g npm
npm install -g ionic
npm install -g @ionic/cli
```

You can verify your installation with the command.
```
ionic --version 
```

**GitHub Versioning Tools**

For clone the repository, you can using the git-Cli.

```
git clone https://github.com/davith01/AppVentas.git
```

or you can clone repository in Github Client.

```
Create your personal account on [Github](https://github.com/)
Download for Windows (msi): [https://desktop.github.com/](https://desktop.github.com/)
```

**Install dependencies package**
```
cd appVentas/
```

Delete node_modules in Windows

```
rmdir /s /q node_modules
rm package-lock.json
```

```
npm install
```

To test server use
```
ionic serve
```

**Adding the Android Platform**

Add platform android to the IONIC proyect.
First, install the @capacitor/android package.

```
ionic capacitor add android
or
npm install @capacitor/android
```

Build platform android.
ionic capacitor build: Build an Ionic project for a given platform

```
ionic capacitor build android
```

Ready for use in your Native IDE!
To continue, build your project using Android Studio!

```
npx cap open android
npx cap update
npx cap sync
```

**Capacitor Google Auth**


Firebase Authentication
[Add Firebase to your project](https://github.com/capawesome-team/capacitor-firebase/blob/main/docs/firebase-setup.md#android)

[https://developers.google.com/android/guides/client-auth?hl=es-419]:(https://developers.google.com/android/guides/client-auth?hl=es-419)     
[https://firebase.google.com/docs/auth/android/google-signin]:(https://firebase.google.com/docs/auth/android/google-signin)
[https://console.firebase.google.com/]:(https://console.firebase.google.com/)
[https://stackoverflow.com/questions/27037194/keystore-file-doesnt-exist]:(https://stackoverflow.com/questions/27037194/keystore-file-doesnt-exist)


**Generate key SHA1 For windows**

```
cd C:\Users\userName>
keytool -genkey -v -keystore debug.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias androiddebugkey

keytool -exportcert -keystore debug.keystore -list -v
Introduzca la contrase±a del almacén de claves: my_pass_key
```

List the keys storage
```
keytool -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore -list -v
keytool -list -v
```

keytools is a command in JAVA_HOME_DIRECTORY, example C:\Program Files\Java\jdk1.7.0_76\bin


**Test app in simulator devices**

Downdolad Genymotion [https://www.genymotion.com](https://www.genymotion.com). User account is required for test!.

Add new AVD (Android Virtual Device) lasted API22 and Run AVD.

For testing the app with the AVD running in Genymotion, 

```
ionic run android --device
```
## Liberies / Plugins included 
* [Ionic-Components](https://ionicframework.com/docs/components/)
* [signature_pad](https://www.npmjs.com/package/signature_pad)
* [fingerprint-aio](https://ionicframework.com/docs/native/fingerprint-aio)
* [pdf-maker](https://pdfmake.github.io/docs/)
* [pdf-maker-tutorial](https://ionicacademy.com/create-pdf-files-ionic-pdfmake/)
* [local-storage](https://ionicframework.com/docs/building/storage)
* [LoadingController](https://ionicframework.com/docs/v3/api/components/loading/LoadingController/)
* [ToastController](https://ionicframework.com/docs/v3/api/components/toast/ToastController/)
* [FontAwesome](https://github.com/FortAwesome/angular-fontawesome)

## Copyright and license

AppVentas is licensed for davith01 2024.

Project is developed by [David Camacho](https://github.com/davith01)
