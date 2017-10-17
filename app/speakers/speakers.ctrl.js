(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('SpeakersCtrl', SpeakersCtrl);

    function SpeakersCtrl($rootScope, SpeakersService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

        vm.removeSpeaker = removeSpeaker;

        function init() {
            getSpeakers();
        }

        function getSpeakers() {
            function success(response) {
                vm.speakers = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            SpeakersService
                .getSpeakers()
                .then(success, error);
        }

        function removeSpeaker(slug) {
            function success() {
                getSpeakers();
                Notification.primary('Removed!');
            }

            function error(response) {
                $log.error(response.data);
            }

            SpeakersService
                .removeSpeaker(slug)
                .then(success, error);
        }

    }
})();
