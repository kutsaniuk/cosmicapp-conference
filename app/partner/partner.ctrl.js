(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('PartnerCtrl', PartnerCtrl); 

    function PartnerCtrl($stateParams, PartnerService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();
        
        vm.removePartner = removePartner;

        function init() {
            getPartners();
        }

        function getPartners() {
            function success(response) {
                vm.partners = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            PartnerService
                .getPartners()
                .then(success, error);
        }

        function removePartner(slug) {
            function success() {
                getPartners();
                Notification.primary('Removed!');
            }

            function error(response) {
                $log.error(response.data);
            }

            PartnerService
                .removePartner(slug)
                .then(success, error);
        }

    }
})();
