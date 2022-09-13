/**
* File name: rootReducer.js
* Author: HongMing
* Function: store state object with firebase store APIs
*/
import { combineReducers } from 'redux';
import { firestoreReducer } from 'redux-firestore';
import { firebaseReducer } from 'react-redux-firebase';

const rootReducer = combineReducers({
  auth: {},
  project: {},
  firestore: firestoreReducer,
  firebase: firebaseReducer
});

export default rootReducer;
