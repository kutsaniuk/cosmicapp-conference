(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('ScheduleCtrl', ScheduleCtrl);

    function ScheduleCtrl($stateParams, ScheduleService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

        vm.toolbarEditor = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'bold', 'italics', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'html']
        ];

        vm.save = save;

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

        function save(schedule) {
            function success() {
                Notification.primary('Schedule updated!');
            }

            function error(response) {
                $log.error(response.data);
            }

            ScheduleService
                .updateSchedule(schedule)
                .then(success, error);
        }

    }
})();
