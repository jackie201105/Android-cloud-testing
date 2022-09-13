/**
* File name: index.js
* Author: HongMing
* Function: the main entry of the web application
*/

import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createFirestoreInstance, getFirestore, reduxFirestore } from 'redux-firestore';
import {
  ReactReduxFirebaseProvider,
  getFirebase,
} from 'react-redux-firebase';
import { Provider } from 'react-redux';
import firebase from 'firebase/app';
import rootReducer from './reducer/rootReducer';
import fbConfig from './config/fbConfig';
import App from './App';

// initialize the store object used for all session information
const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk.withExtraArgument({ getFirebase, getFirestore })),
    reduxFirestore(firebase, fbConfig)
  )
);

// initialize user profile configuration for firebase
const profileSpecificProps = {
  userProfile: 'users',
  useFirestoreForProfile: true,
  enableRedirectHandling: false,
  resetBeforeLogin: false
};

// initialize provider configuration for react redux
const rrfProps = {
  firebase,
  config: profileSpecificProps,
  dispatch: store.dispatch,
  createFirestoreInstance,
};

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <App />
      </ReactReduxFirebaseProvider>
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
);
