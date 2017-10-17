(function () {
    'use strict';
    
    angular
        .module('register', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.register', {
                url: 'registration',
                title: 'Registration',
                templateUrl: '../views/register/register.html',
                controller: 'RegisterCtrl as vm'
            });
    }
})();
 