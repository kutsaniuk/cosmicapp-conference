(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl(RegisterService, $log, Notification, $state) {
        var vm = this;

        vm.registerForm = null;
        vm.member = {};
        
        vm.register = register;
        
        function register() {
            function success() {
                Notification.primary('You registered!');
                $state.go('main.schedule');
            }

            function error(response) {
                $log.error(response.data);
            }

            RegisterService
                .register(vm.member)
                .then(success, error);
        }

    }
})();
