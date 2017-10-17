(function () {
    'use strict';
    
    angular
        .module('photos', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.photos', {
                url: 'photos',
                title: 'Photos',
                templateUrl: '../views/photos/photos.html',
                controller: 'PhotosCtrl as vm'
            });
    }
})();
 