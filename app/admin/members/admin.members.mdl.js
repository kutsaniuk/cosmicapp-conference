(function () {
    'use strict';
    
    angular
        .module('admin.members', [
            'admin.members.edit',
            'admin.members.add'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.members', {
                url: 'members',
                templateUrl: '../views/admin/admin.members.html',
                controller: 'AdminMembersCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 