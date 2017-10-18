(function () {
    'use strict';
    
    angular
        .module('admin.partners.edit', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.partners.edit', {
                url: '/edit/:slug',
                onEnter: [
                'ngDialog',
                'PartnerService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, PartnerService, $stateParams, $state, $log) {
                    getPartner($stateParams.slug);
    
                    function getPartner(slug) {
                        function success(response) {
                            openDialog(response.data.object);
                        }
    
                        function failed(response) {
                            $log.error(response);
                        }

                        PartnerService
                            .getPartnerBySlug(slug)
                            .then(success, failed);
                    }
    
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.partners.edit.html',
                            data: data,
                            controller: 'AdminPartnersEdit as vm',
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
 