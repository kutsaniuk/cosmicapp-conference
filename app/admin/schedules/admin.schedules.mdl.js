(function () {
    'use strict';
    
    angular
        .module('admin.schedules', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.schedules', {
                url: 'schedules',
                templateUrl: '../views/admin/admin.schedules.html',
                controller: 'ScheduleCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 