(function () {
    'use strict';
    
    angular
        .module('home', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.home', {
                url: '',
                templateUrl: '../views/home/home.html',
                controller: 'AboutCtrl as vm'
            });
    }
})();
 