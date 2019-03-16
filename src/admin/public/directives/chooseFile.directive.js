(function(app){
    'use strict';
    
    app.directive('chooseFile', function ($log) {
    return {
        
        link: function (scope, elem, attrs) {
        var button = elem.find('button')
        // let scheduleName = attrs.scheduleName
        // let schedule = attrs.scheduleObj
        var index = attrs.index
        var input = angular.element(elem[0].querySelector('input'))
            //$log.info("Input Element", input)
        button.bind('click', function () {
            // scope.fileName = null
            input[0].click()
        })
        input.bind('change', function (e) {
            scope.$apply(function () {
            var files = e.target.files
            if (files[0]) {
                scope.settings.selectedSchedule.fileName = files[0].name
                $log.info(scope.settings)
                const reader = new FileReader();
                reader.onload = function(event){
                    // NOTE: event.target point to FileReader
                    var contents = event.target.result;
                    scope.convertScheduleToJson(contents)
                    
                    
                };
                reader.readAsText(files[0]);

            } else {
                scope.fileName = null
            }
            })
        })
        }
    }
    })
  
})(window.app);
