(function () {
    'use strict';
    
    angular
        .module('admin.partners.add', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.partners.add', {
                url: '/add',
                onEnter: [
                'ngDialog',
                'PartnerService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, PartnerService, $stateParams, $state, $log) {
                    openDialog(PartnerService.partner);
                        
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.partners.edit.html',
                            data: data,
                            controller: 'AdminPartnerAdd as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.partners', {}, {reload: !data.value});
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
 