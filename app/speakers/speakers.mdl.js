(function () {
    'use strict';
    
    angular
        .module('speakers', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.speakers', {
                url: 'speakers',
                title: 'Speakers',
                templateUrl: '../views/speakers/speakers.html',
                controller: 'SpeakersCtrl as vm'
            });
    }
})();
 