(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AboutCtrl', AboutCtrl);

    function AboutCtrl($stateParams, AboutService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

        vm.toolbarEditor = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'bold', 'italics', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'html']
        ];

        vm.save = save;

        function init() {
            getPages();
        }
        
        function getPages() {
            function success(response) {
                vm.pages = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            AboutService
                .getPages()
                .then(success, error);
        }

        function save(index) {
            function success() {
                Notification.primary('Update Page "' + vm.pages[index].title + '" success!');
            }

            function error(response) {
                $log.error(response.data);
            }

            AboutService
                .updatePages(vm.pages[index])
                .then(success, error);
        }
    }
})();
