app.controller('appController', function AppController ($http, $log, $scope, $rootScope, $timeout, $mdToast, $firebaseObject, User, $mdSidenav, $mdPanel, $mdDialog, $sce, Oboe, $cookies, jwtHelper, $httpParamSerializerJQLike, moment, $filter) {
  var db = firebase.firestore()

  db.settings({
    timestampsInSnapshots: true
  })

  $scope.myData = [];
  $scope.schedules = []
  $scope.applications = []
  $scope.environments = {}
  $scope.environment = {}
  $scope.bearerToken = ""
  $scope.host = 'production'
  $scope.user = {}
  $scope.userId = {}
  $scope.colorPicker = {}
  $scope.isLoggedIn = false
  $scope.installDone = true;
  $scope.services = ''
  $scope.selectedDemo = {}
  $scope.scheduleInfo = {}
  $scope.selectedTabIndex = {
    tabIndex: 1
  }
  $scope.showDemoButton = false
  $scope.settings = {}
  $scope.toggleLeft = buildDelayedToggler('left')

  

  function debounce (func, wait, context) {
    var timer
    return function debounced () {
      var context = $scope,
        args = Array.prototype.slice.call(arguments)
      $timeout.cancel(timer)
      timer = $timeout(function () {
        timer = undefined
        func.apply(context, args)
      }, wait || 10)
    }
  }

  function buildDelayedToggler (navID) {
    return debounce(function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug('toggle ' + navID + ' is done')
        })
    }, 200)
  }

  function buildToggler (navID) {
    return function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug('toggle ' + navID + ' is done')
        })
    }
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      $timeout(function () {
        $scope.isLoggedIn = true
        $scope.user = user
        $log.info("User: ",user)
        $scope.saveUser(user)
        $scope.getFirebaseUserSchedules()
        $scope.getFirebaseEnvironment()
      })
      
    } else {
      $timeout(function () {
        $scope.isLoggedIn = false
        ui.start('#firebaseui-auth-container', uiConfig)
      })
    }
    
  })
  
  $scope.checkSideBar = function(){
    $scope.selectedTabIndex.tabIndex = 0
    $log.info("selectedTabIndex: ", $scope.selectedTabIndex)
    if ($mdSidenav('left') && $mdSidenav('left').isOpen()) {
      $scope.toggleLeft()
    }
  }

  $scope.resetSelectedDetail = function(schedule) {
    schedule.lastSlideDetail = -1

  }
  
  $scope.saveUser = function (user) {
    db.collection('users').doc(user.uid).set({
      'uid': user.uid,
      'displayName': user.displayName,
      'photoURL': user.photoURL,
      'email': user.email
    })
      .then(function () {
        $log.info('User written ')
      })
      .catch(function (error) {
        console.error('Error adding User: ', error)
      })
  }

  $scope.logout = function () {
    firebase.auth().signOut().then(function () {
      $timeout(function(){
        $scope.isLoggedIn = false
        $scope.showDemoButton = false
        $scope.user = {}
        $scope.userId = {}
        $scope.schedules = []
      })
    })
  }
  
  $scope.validateAuthToken = function () {
    var token = $cookies.getObject("api")
    if (token) {
      $scope.api = token
      $log.info("Api Token: ", token)
      var bearerToken = token.bearerToken
      var decoded = jwtHelper.decodeToken(bearerToken)
      $log.info("Decoded BearerToken", decoded)
      if (!jwtHelper.isTokenExpired(bearerToken)) {
        $scope.bearerToken = bearerToken
        $scope.showAuthForm = false
        $scope.checkDemoAdmin()
        
      } else {
        $cookies.remove("api")
        $scope.showAuthForm = true
        $scope.showDemoButton = false
      }
    } else {
      $scope.showAuthForm = true
    }
  }
  $scope.checkDemoAdmin = function() {
    $scope.schedulesOnlineLoading = true
    $scope.domainFileExists($scope.api.customClaims.domain)
    if ($scope.api.customClaims.role === 'admin' || $scope.api.customClaims.role === 'superadmin') {
      $scope.showDemoButton = false
    }
    
    // $timeout(function(){
    //   $scope.getDomainOnlineStatus($scope.api.customClaims.domain)
    // },2000)
  }
  $scope.getAuthToken = function (user) {
      var authUrl = 'https://' + $scope.environment.dashboardHost + '/auth/email/json'
      var request = {
        method: "POST",
        url: authUrl,
        data: {
            'email': user.dashboardEmail,
            'password': user.dashboardPassword
        }
      }
      $http(request).then( function (success) {
        $scope.api = success.data
        $scope.bearerToken = $scope.api.bearerToken
        $cookies.putObject("api", success.data)
        $scope.showAuthForm = false
        $log.info("Success: ", success.data.bearerToken)
        $scope.checkDemoAdmin()
        
        
      }, function (error) {
        $log.error("Error: ", error, request)
        $cookies.remove("api")
        $scope.showAuthForm = true
        $scope.showDemoButton = false
      })
  }

  $scope.domainFileExists = function (domain) {
    let file = '/' + domain + '.html'
    $http.get(file).then(function (success){
      $log.info("Domain Demo", file)
      $scope.showDemoButton = true
    }, function  (error) {
      $log.error("Domain Error", file)
      $scope.showDemoButton = false
    })
  }

  $scope.getDomainOnlineStatus = function(domain) {
    let request = {
      url: 'https://' + $scope.environment.dashboardHost + '/api/domain/' + $scope.api.customClaims.domain,
      headers: {
        'Authorization': 'Bearer ' + $scope.bearerToken,
        'Content-Type': 'application/json'
      },
      data: ''
    }
    $http(request).then(function(success){
      $log.info("Domain Schedules", success.data)
      $scope.scheduleInfo = success.data.schedules
      $scope.schedulesOnlineLoading = false

    }, function(error){
      $log.error("Domain Schedules Error", error)
    })
  }

  $scope.removeAuthToken = function() {
    $cookies.remove("api")
    $scope.showAuthForm = true
    $scope.showDemoButton = false
  }

  $scope.getFirebaseUserSchedules = function () {
    $scope.schedules = []
    db.collection('users').doc($scope.user.uid).collection('schedules').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        $timeout(function () {
          $scope.schedules.push(doc.data())
        })
      })
      $log.info('schedules', $scope.schedules)
    })
  }

  $scope.convertScheduleToJson = function(calendar) {
    var events = $scope.parseCalendar(calendar)
    $scope.settings.selectedSchedule.events = events
    $scope.saveSchedule($scope.settings.selectedSchedule)
  }
  $scope.parseCalendar = function(data) {
    var jcalData = ICAL.parse(data);
    var comp = new ICAL.Component(jcalData);
    var vevents = comp.getAllSubcomponents("vevent");
    var events = []

    for(var i in vevents){
      let event = {}
      let props = vevents[i].getAllProperties()
      for (let p in props) {
        event[props[p].name] = props[p].toJSON()[3]
      }

      events.push(event)

    }
    $log.info("jcalData: ", events)

    return events

  
  }

  $scope.convertScheduleToJsonFromUrl = function(user, myUrl) {
    // var trustedUrl = $sce.trustAsResourceUrl(url);
    let oldSchedule = $scope.settings.selectedSchedule
    if(myUrl){

      var req = {
        method: 'POST',
        url: 'http://localhost:5001/oak-schedule/us-central1/getIcsContentsFromUrl',
        data: { 
          user: user, 
          url: myUrl 
        }
       }
      $http(req).then(
        function(success){
          var events = $scope.parseCalendar(success.data)
          $scope.settings.selectedSchedule.events = events
          $scope.saveSchedule($scope.settings.selectedSchedule)
        }, function(error){
          $log.error("Calendar Url Error: ", error)
        })

    } else {
      $mdToast.show(
        $mdToast.simple()
          .textContent('No Url Entered')
          .position('bottom left')
          .hideDelay(1000)
          .toastClass("error-toast")
      )
    }
    // var jsonData = ical2json.convert(calendar);
    // $log.info("jsonData: ", jsonData)
    // //$scope.addSchedule(name)
    // $scope.settings.selectedSchedule.events = jsonData['VCALENDAR'][0]['VEVENT']
    // $scope.saveSchedule($scope.settings.selectedSchedule)


  }

  $scope.addCalendarSubscriptionForUser = function (user, selectedCalendar) {
    let local = "http://localhost:5001/oak-schedule/us-central1/addCalendarSubscriptionForUser"
    let remote = "https://us-central1-oak-schedule.cloudfunctions.net/addCalendarSubscriptionForUser"
    if(selectedCalendar.calendarUrl){

      selectedCalendar.user = user.uid

      var req = {
        method: 'POST',
        url: local,
        data: selectedCalendar
       }
      $http(req).then(
        function(success){
          $log.error("Calendar Subscription Success: ", success)
          $timeout(function(){
            $scope.getFirebaseUserSchedules()
            $scope.goHome()
          })
        }, function(error){
          $log.error("Calendar Subscription  Error: ", error)
        })

    } else {
      $mdToast.show(
        $mdToast.simple()
          .textContent('No Url Entered')
          .position('bottom left')
          .hideDelay(1000)
          .toastClass("error-toast")
      )
    }
  }

  $scope.getFirebaseEnvironment = function () {
    $timeout(function () {
      db.collection('environment').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            $scope.environments[doc.id] = {
              dashboardHost: doc.data().dashboardHost,
              dashboardVersion: doc.data().dashboardVersion
            }
        })
        $scope.environment = $scope.environments[$scope.host]
        $log.info('environment:', $scope.environment)
        
      })
      
    })
  }
  
  $scope.addSchedule = function (name) {
      var results = _.find($scope.schedules, ['name', name])
      if (!results) {
        let newSchedule = {
          'now': Date.now(),
          'name': _.snakeCase(name)

        }
        $scope.schedules.push(newSchedule)
        $scope.saveSchedule(newSchedule)
      } else {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Schedule name exists')
            .position('bottom left')
            .hideDelay(1000)
            .toastClass("error-toast")
        )
      }
  }

  $scope.formatScheduleName = function(name) {
    return _.startCase(name)
  }

  $scope.saveSchedule = function (schedule) {
    
    let newSchedule = JSON.parse(angular.toJson( schedule ))
    db.collection('users').doc($scope.user.uid).collection('schedules').doc(newSchedule.name).set(newSchedule)
      .then(function () {
        $log.info('Schedule written ')
        $timeout(function () {
          $log.info('Schedules: ', $scope.schedules)
        })
        $mdToast.show(
          $mdToast.simple()
            .textContent('Schedule ' + newSchedule.name + ' saved!')
            .position('bottom left')
            .hideDelay(1000)
            .toastClass("success-toast")
        )
      })
      .catch(function (error) {
        console.error('Error adding Schedule: ', error)
        $scope.settings.selectedSchedule.events = {}
        
        $mdToast.show(
          $mdToast.simple()
            .textContent(error)
            .position('bottom left')
            .hideDelay(1000)
            .toastClass("error-toast"))
      })
  }

  $scope.updateUser = function (user, authForm) {
    if(authForm.$valid) {
      db.collection('users').doc($scope.user.uid).set({
        'uid': user.uid,
        'displayName': user.displayName,
        'photoURL': user.photoURL,
        'email': user.email,
        'dashboardEmail': user.dashboardEmail,
        'dashboardPassword': user.dashboardPassword
      })
      .then(function () {
        $log.info('Auth written: ', user)
        $mdToast.show(
          $mdToast.simple()
            .textContent('User Info Saved')
            .position('bottom left')
            .hideDelay(1000)
            .toastClass("success-toast")
        )
      })
      .catch(function (error) {
          $log.error('Error adding auth: ', error)
      })
    }
  }
  
  $scope.deleteSchedule = function (scheduleName) {
      db.collection('users').doc($scope.user.uid).collection('schedules').doc(scheduleName).delete()
      .then(function () {
        $log.info('Document successfully deleted!')
        $timeout( function () {
          _.remove($scope.schedules, function (e) {
            return e.name === scheduleName;
          });
          if ($scope.schedules.length){
            $timeout( function () {
              let buttons = angular.element(document.querySelector('.scheduleList')).find("md-radio-button")
              $log.info("buttons: ", buttons)
              buttons[0].click()
            },50)
          } else {
            window.location.href = "/"
          }
        })
      }).catch(function (error) {
        console.error('Error removing document: ', error)
      })
  }
  
  $scope.showAddSchedulePrompt = function(ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.prompt()
        .title('Schedule name?')
        .textContent('Spaces will be converted to underscores.')
        .placeholder('Schedule name')
        .ariaLabel('Schedule name')
        .targetEvent(ev)
        .required(true)
        .ok('Add')
        .cancel('Cancel');
      $mdDialog.show(confirm).then(function(result) {
        $scope.addSchedule(result)
      }, function() {
        $scope.status = 'You didn\'t name your dog.';
      });
  }
  
  $scope.showScheduleConfirm = function(ev, name) {
    $scope.currentScheduleName = name
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Are you sure you want to delete this entire schedule?')
          .textContent('All of the images and associated data will be lost permentently')
          .ariaLabel('Are you sure?')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      $log.info($scope.currentScheduleName)
      $scope.deleteSchedule($scope.currentScheduleName)
    }, function() {
      $scope.status = 'You decided to keep your debt.';
    });
  };
  $scope.setApplicationRequest = function(serviceSelect){
    $timeout(function() {
      $scope.services =  JSON.stringify({
        services: serviceSelect.services
      }, null, " ")
      var textarea = document.getElementById('servicesTextArea');
      textarea.value = $scope.services
      
    })
  }
  $scope.installApplication = function(schedule, services) {
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
 
    if(typeof services === 'undefined') return false
    var installUrl = 'https://' + $scope.environment.dashboardHost + '/api/' + $scope.environment.dashboardVersion + '/schedule/' + schedule + '/application/install?streaming=true&timeout=3000000'
    $scope.installDone = false;
    $scope.installError = false;
    $scope.installStep = "STARTING INSTALL"
    $scope.installDetails = " "
    Oboe({
      url: installUrl ,
      pattern: '{step}',
      method: 'POST',
      body: JSON.parse(services),
      data: '',
      headers: {
        'Authorization': 'Bearer ' + $scope.bearerToken,
        'Content-Type': 'application/json'
      },
      start: function(stream) {
          $scope.installDone = false;
          $scope.installError = false;
          $log.info("Install Stream Started: ")
      },
      done: function(parsedJSON) {

        $log.info("Done: ", parsedJSON)
        if(parsedJSON.hasOwnProperty('error')){
          $scope.installDone = true;
          $scope.installError = true;
          $scope.installErrorText = parsedJSON.error;
          $timeout(function () {
            $scope.installDone = true;
            $scope.installError = false;
          },3000)
        }
      }
    }).then(function(error) {
        // promise is resolved
        $log.info("Promise Resolved: ", error)

    }, function(error) {
        // handle errors
        $log.info("Errors: ", error)
        $scope.installDone = true;
        $scope.installError = true;
    }, function(node) {
        // node received
        $scope.installStep = node.step.replace("_", " ");
        if (isJson(node.details)) {
          let details = JSON.parse(node.details)
          $scope.installDetails = details.status
        }
        
        $log.info("Node: ", node)
        
        if (node.step === "END") {
          
          var swapUrl = 'https://' + $scope.environment.dashboardHost +'/api/' + $scope.environment.dashboardVersion + '/schedule/' + schedule + '/application/SwapIdleAndLive'
          var swapRequest = {
            headers: {
              'Authorization': 'Bearer ' + $scope.bearerToken ,
              'Content-Type': 'application/json'
            },
            url: swapUrl,
            data: ''
          }
          $log.info('SWAP CALL')
          $scope.installStep = "SWAPPING APPLICATION"
          $http(swapRequest).then( function (success){
            $log.info("Success: ", success)
            $timeout(function () {
              $scope.installDone = true;
              $scope.installError = false;
            },1000)
          }, function (error){
            $log.info("Error: ", error)
            
          })
        }
        if($scope.myData.length === 1000) {
            $scope.stream.abort();
            alert('The maximum of one thousand records reached');
        }
    });
  }

  $scope.mdToHtml = function (text) {
    return $sce.trustAsHtml(markdown.toHTML(text));
  }

  $scope.goHome = function() {
    delete $scope.settings.selectedSchedule
  }

  $scope.installDemoApplication = function (appId) {
    if(!$scope.selectedDemo) return false
    let app = _.find($scope.applications, function(obj) { 
      return obj.id === appId
    });
    $log.info("Selected demo app to install\n", JSON.stringify({'services': app.services}))
    $scope.installApplication($scope.selectedDemo.schedule, JSON.stringify({'services': app.services}))
  }

  $scope.setSelectedDemoKiosk = function(id, schedule, galleryName) {
    if(!$scope.installDone) return false
    $scope.selectedDemo = {
      "galleryName": galleryName,
      "schedule": schedule,
      "services": [
        {
          "image": "index.docker.io/oaklabs/app-signage:release-1.0.9",
          "environment": {
                    "API_KEY": "r7eJvn9HIvMh25CWknMUFoNuW2d2",
                    "GALLERY_NAME": galleryName
                }
          
        }
      ]
    }

    

    $timeout(function(){
      $('.st1').removeClass("selected");
      $(id).addClass('selected')
    })
  }
  $scope.clearSelectedDemoKiosks = function() {
    $timeout(function(){
      $scope.selectedDemo = {}
      $('.st1').removeClass("selected");
    })
  }
  $scope.restoreSelectedDemoKiosk = function () {
    $scope.installApplication($scope.selectedDemo.schedule, JSON.stringify({'services': $scope.selectedDemo.services}))
  }
  $scope.getShortDate = function(fullDate){
    return $filter('date')(fullDate, "MM/dd/yyyy")
  }
  $scope.getTodayDate = function(){
    return $filter('date')(Date.now(), "MM/dd/yyyy")
  }

  $scope.initApp = function () {
    $scope.validateAuthToken()
  }

  $scope.initApp()

})
