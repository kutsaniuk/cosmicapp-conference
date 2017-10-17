(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('PartnerCtrl', PartnerCtrl);

    function PartnerCtrl($stateParams, PartnerService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

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

    }
})();
