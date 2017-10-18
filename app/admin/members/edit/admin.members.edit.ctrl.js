(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminMembersEdit', AdminMembersEdit);

    function AdminMembersEdit(AdminMembersService, Notification, $log, ngDialog, $scope) {
        var vm = this;

        vm.save = updateMember;

        vm.action = 'edit';

        function updateMember() {
            function success(response) {
                $log.info(response);

                Notification.primary(
                    {
                        message: 'Updated!',
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
                .updateMember($scope.ngDialogData)
                .then(success, failed);
        }
    }
})();
