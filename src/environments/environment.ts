// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const firebaseConfig = {
  apiKey: "AIzaSyA24lTIFx0Ei1NzIoPEx2HNcscLWcxx0Ro",
  authDomain: "appventas-94c92.firebaseapp.com",
  projectId: "appventas-94c92",
  storageBucket: "appventas-94c92.appspot.com",
  messagingSenderId: "180168560911",
  appId: "1:180168560911:web:50d455febc3722a07fee7a",
  measurementId: "G-K7E1XDHQQR"
};

export const environment = {
  production: false,
  firebase: firebaseConfig,
  appName: 'appVentas',
  urlIcon: 'assets/icon/logo.png'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
