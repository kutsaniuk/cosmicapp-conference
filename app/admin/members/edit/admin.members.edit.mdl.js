(function () {
    'use strict';
    
    angular
        .module('admin.members.edit', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.members.edit', {
                url: '/edit/:slug',
                onEnter: [
                'ngDialog',
                'AdminMembersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, AdminMembersService, $stateParams, $state, $log) {
                    getMember($stateParams.slug);
    
                    function getMember(slug) {
                        function success(response) {
                            openDialog(response.data.object);
                        }
    
                        function failed(response) {
                            $log.error(response);
                        }

                        AdminMembersService
                            .getMemberBySlug(slug)
                            .then(success, failed);
                    }
    
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.members.edit.html',
                            data: data,
                            controller: 'AdminMembersEdit as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.members', {}, {reload: !data.value});
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
 