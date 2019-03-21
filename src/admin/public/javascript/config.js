var config = {
  apiKey: "AIzaSyDr_LrNrgPwZXtSTXScZJ3DvMB-gmP2hec",
  authDomain: "oak-schedule.firebaseapp.com",
  databaseURL: "https://oak-schedule.firebaseio.com",
  projectId: "oak-schedule",
  storageBucket: "oak-schedule.appspot.com",
  messagingSenderId: "1046369340167"
}
firebase.initializeApp(config)
// Initialize Cloud Firestore through Firebase

// FirebaseUI config.
var uiConfig = {
  signInSuccessUrl: 'index.html',
  // signInFlow: 'popup',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: 'tos.html',
  // Privacy policy url/callback.
  privacyPolicyUrl: function () {
    window.location.assign('privacy.html')
  }
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth())
// The start method will wait until the DOM is loaded.
// ui.start('#firebaseui-auth-container', uiConfig);
