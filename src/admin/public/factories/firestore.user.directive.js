app.factory('User', ['$firebaseObject',
  function ($firebaseObject) {
    return function (uid) {
      // create a reference to the database node where we will store our data
      var ref = firebase.database().ref('users').push()
      var userRef = ref.child(uid)

      // return it as a synchronized object
      return $firebaseObject(userRef)
    }
  }
])
