(function () {
    'use strict';
    
    angular
        .module('admin.partners', [
            'admin.partners.edit',
            'admin.partners.add'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.partners', {
                url: 'partners',
                templateUrl: '../views/admin/admin.partners.html',
                controller: 'PartnerCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 