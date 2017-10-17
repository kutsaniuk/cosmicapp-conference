(function () {
    'use strict';
    
    angular
        .module('admin.speakers.add', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.speakers.add', {
                url: '/add',
                onEnter: [
                'ngDialog',
                'SpeakersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, SpeakersService, $stateParams, $state, $log) {
                    openDialog(SpeakersService.speaker);
                        
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.speakers.edit.html',
                            data: data,
                            controller: 'AdminSpeakersAdd as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.speakers', {}, {reload: !data.value});
                                return true;
                        });
                    }
                }],
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 