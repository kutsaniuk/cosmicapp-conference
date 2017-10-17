(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('ScheduleCtrl', ScheduleCtrl);

    function ScheduleCtrl($stateParams, ScheduleService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

        function init() {
            getSchedules(); 
        }

        function getSchedules() {
            function success(response) {
                vm.schedules = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            ScheduleService
                .getSchedules()
                .then(success, error);
        }

    }
})();
