window.oak.disableZoom()

window.reload = function () {
  window.oak.reload()
}

var app = window.angular
  .module('scheduleApp', ['ngMaterial'])
  .constant('os', window.os)
  .constant('oak', window.oak)
  .constant('_', window._)
  
  .config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self'])
  })

app.controller('appController', function ($log, $sce, $timeout, $scope, $http, $window, oak, _) {
  // ripples
  $scope.untapped = true
  $scope.swiper = false
  $scope.cursor = {
    x: 0, y: 0
  }
  $scope.showCursor = false
  $scope.shouldReload = false
  $scope.cursorTimeout = 10000
  var cursorPromises = []
  var timer

  // main window touches. this will log all tapped items, and also add the UI ripple of the tapped area
  $scope.ripples = []

  $http({
    method: 'GET',
    url: '/env'
  }).then(function successCallback (response) {
    $scope.environment = response.data

    db.collection('users').doc($scope.environment.apiKey).collection('schedules').doc($scope.environment.scheduleName)
      .onSnapshot(function (doc) {
        
        var source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
        console.log(source, ' data: ', doc.data())
        $timeout(function () {
          $scope.initApp(doc)
        })
      })
    }, function errorCallback (response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    })
    
  $scope.initApp = function (doc) {
    $scope.schedule = doc.data()
  }

  $scope.mdToHtml = function (text) {
    return $sce.trustAsHtml(markdown.toHTML(text))
  }

  $scope.formatDateString = function(date, format) {
    return moment(date).format(format)
  }

  $scope.sortStartDate = function(item){
    var date = new Date(item.start);
    return date;
  }

  $scope.getTodayDate = function(){
    return moment(Date.now()).format("MM-DD-YYYY")
  }

  $scope.betweenFilter = function(item) {
    return moment(item.start).isBetween(moment($scope.schedule.startDate).format("MM-DD-YYYY"), moment($scope.schedule.endDate).add(1,'days').format("MM-DD-YYYY"))
  }

  $scope.startCase = function(str) {
    return _.startCase(str)
  }
  $scope.isAllDay = function(item) {
    return $scope.formatDateString(item.start, 'h:mm a') === $scope.formatDateString(item.end, 'h:mm a')
  }

  oak.ready()
})
