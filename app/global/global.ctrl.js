(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('GlobalCtrl', GlobalCtrl);

    function GlobalCtrl($scope, Notification, $log, $rootScope, $state) {
        var vm = this;
        
        $scope.$state = $state;
        
        vm.title = $rootScope.title ? $rootScope.title + ' - ANGULAR SUMMIT' : 'ANGULAR SUMMIT';
        

    }
})(); 
