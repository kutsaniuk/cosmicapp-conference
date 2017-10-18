(function () {
    'use strict';
    
    angular
        .module('admin', [
            'admin.pages',
            'admin.speakers',
            'admin.schedules',
            'admin.partners',
            'admin.members'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('admin', {
                url: '/admin/',
                abstract: true,
                templateUrl: '../views/admin/admin.html',
                controller: 'GlobalCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }

})();
 