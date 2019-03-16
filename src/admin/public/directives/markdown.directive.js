app.directive('markdown', function ($log, $http, $compile, $timeout) {
  return {
      restrict: 'A',
      scope: {
        link: '@'
      },
      templateUrl: function(elem, attrs) {
        return attrs.link;
      },
      compile: function ($scope, $element) {
        return {
          pre: function(scope, element, attributes, controller, transcludeFn){
            var htmlText = md.render(element.text())
            element.html(htmlText)
            $compile(element.contents())(scope);
          }
        }
      }
  }

});