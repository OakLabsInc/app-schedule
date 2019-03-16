
var md = window.markdownit();
function parseDate(input) {
    var parts = input.split('-');
    return new Date(parts[2], parts[1]-1, parts[0]); 
  }
  
var app = angular.module('showroomApp', ['ngMaterial', 'ngMessages', 'mdColorPicker', 'firebase', 'ngOboe', 'ngCookies', 'angular-jwt', 'angularMoment'])
.constant('_', window.lodash)
.run(function($http) {
//     $http.defaults.headers.common['Content-Type'] = 'application/json';
    // $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
}).filter("todayFilter", function() {
    return function(items, from, to) {

          var result = [];        
          for (var i=0; i<items.length; i++){
              var tf = new Date(items[i].date1 * 1000),
                  tt = new Date(items[i].date2 * 1000);
              if (tf > df && tt < dt)  {
                  result.push(items[i]);
              }
          }            
          return result;
    };
  });;
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
