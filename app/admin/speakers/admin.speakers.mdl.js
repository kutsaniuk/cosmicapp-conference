(function () {
    'use strict';
    
    angular
        .module('admin.speakers', [
            'admin.speakers.edit',
            'admin.speakers.add'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.speakers', {
                url: 'speakers',
                templateUrl: '../views/admin/admin.speakers.html',
                controller: 'SpeakersCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 