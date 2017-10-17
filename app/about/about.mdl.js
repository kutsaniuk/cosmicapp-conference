(function () {
    'use strict';
    
    angular
        .module('about', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.about', {
                url: '',
                templateUrl: '../views/about/about.html',
                controller: 'AboutCtrl as vm'
            });
    }
})();
 