(function () {
    'use strict';
    
    angular
        .module('admin.speakers.edit', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.speakers.edit', {
                url: '/edit/:slug',
                onEnter: [
                'ngDialog',
                'SpeakersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, SpeakersService, $stateParams, $state, $log) {
                    getSpeaker($stateParams.slug);
    
                    function getSpeaker(slug) {
                        function success(response) {
                            openDialog(response.data.object);
                        }
    
                        function failed(response) {
                            $log.error(response);
                        }

                        SpeakersService
                            .getSpeakerBySlug(slug)
                            .then(success, failed);
                    }
    
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.speakers.edit.html',
                            data: data,
                            controller: 'AdminSpeakersEdit as vm',
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
 