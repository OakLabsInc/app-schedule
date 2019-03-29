
var md = window.markdownit();
function parseDate(input) {
    var parts = input.split('-');
    return new Date(parts[2], parts[1]-1, parts[0]); 
  }
  
var app = angular.module('scheduleApp', ['ngMaterial', 'ngMessages', 'mdColorPicker', 'firebase', 'ngOboe', 'ngCookies', 'angular-jwt'])
.constant('_', window._)
.run(function($http) {
//     $http.defaults.headers.common['Content-Type'] = 'application/json';
    // $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
}).filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
// .config(function($mdThemingProvider) {
//   // Extend the red theme with a different color and make the contrast color black instead of white.
//   // For example: raised button text will be black instead of white.
//   var neonRedMap = $mdThemingProvider.extendPalette('red', {
//     '500': '#ff0000',
//     'contrastDefaultColor': 'dark'
//   });
//   // Register the new color palette map with the name <code>neonRed</code>
//   $mdThemingProvider.definePalette('neonRed', neonRedMap);
//   // Use that theme for the primary intentions
//   $mdThemingProvider.theme('default')
//     .primaryPalette('neonRed');
// });
