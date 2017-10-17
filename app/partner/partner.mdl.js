(function () {
    'use strict';
    
    angular
        .module('partner', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.partner', {
                url: 'partner',
                title: 'Partner',
                templateUrl: '../views/partner/partner.html',
                controller: 'PartnerCtrl as vm'
            });
    }
})();
 