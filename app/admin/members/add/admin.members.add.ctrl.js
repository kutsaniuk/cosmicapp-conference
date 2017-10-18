(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminMembersAdd', AdminMembersAdd);

    function AdminMembersAdd(AdminMembersService, Notification, $log, ngDialog, $scope) {
        var vm = this;

        vm.save = createMember;

        vm.action = 'add';

        vm.member = {};

        function createMember() {
            function success(response) {
                $log.info(response);

                Notification.primary(
                    {
                        message: 'Created!',
                        delay: 800,
                        replaceMessage: true
                    }
                );

                ngDialog.close();
            }

            function failed(response) {
                $log.error(response);
            }

            AdminMembersService
                .createMember($scope.ngDialogData)
                .then(success, failed);
        }

    }
})();
