var app = firebase.initializeApp({
    apiKey: "AIzaSyDr_LrNrgPwZXtSTXScZJ3DvMB-gmP2hec",
    authDomain: "oak-schedule.firebaseapp.com",
    databaseURL: "https://oak-schedule.firebaseio.com",
    projectId: "oak-schedule",
    storageBucket: "oak-schedule.appspot.com",
    messagingSenderId: "1046369340167"
  });
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();

  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });