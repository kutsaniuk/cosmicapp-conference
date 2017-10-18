(function () {
    'use strict';
    
    angular
        .module('admin.members.add', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.members.add', {
                url: '/add',
                onEnter: [
                'ngDialog',
                'AdminMembersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, AdminMembersService, $stateParams, $state, $log) {
                    openDialog(AdminMembersService.member);
                        
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.members.edit.html',
                            data: data,
                            controller: 'AdminMembersAdd as vm',
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
 