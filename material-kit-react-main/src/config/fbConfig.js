/**
* File name: fbConfig.js
* Author: HongMing
* Function: configuration of firebase
*/

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: '', // TODO
  authDomain: '', // TODO
  databaseURL: '', // TODO
  projectId: '', // TODO
  storageBucket: '', // TODO
  messagingSenderId: '', // TODO
  appId: '', // TODO
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
