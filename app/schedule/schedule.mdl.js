(function () {
    'use strict';
    
    angular
        .module('schedule', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.schedule', {
                url: 'schedule',
                title: 'Schedule',
                templateUrl: '../views/schedule/schedule.html',
                controller: 'ScheduleCtrl as vm'
            });
    }
})();
 