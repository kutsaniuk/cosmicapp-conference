(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminMembersCtrl', AdminMembersCtrl);

    function AdminMembersCtrl(AdminMembersService, Notification, $log) {
        var vm = this;

        init();
        
        vm.removeMember = removeMember;
        
        function init() {
            getMembers();
        }

        function getMembers() {
            function success(response) {
                vm.members = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            AdminMembersService
                .getMembers()
                .then(success, error);
        }

        function removeMember(slug) {
            function success() {
                getMembers();
                Notification.primary('Removed!');
            }

            function error(response) {
                $log.error(response.data);
            }

            AdminMembersService
                .removeMember(slug)
                .then(success, error);
        }

    }
})();
