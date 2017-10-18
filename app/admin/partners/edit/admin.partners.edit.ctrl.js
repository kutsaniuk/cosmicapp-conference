(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminPartnersEdit', AdminPartnersEdit);

    function AdminPartnersEdit(PartnerService, Notification, $log, $scope, MEDIA_URL, ngDialog) {
        var vm = this;

        vm.save = upload;

        vm.uploadProgress = 0;
        vm.action = 'edit';

        vm.partner = {};
        vm.flow = {};

        vm.flowConfig = {
            target: MEDIA_URL,
            singleFile: true
        };

        function updatePartner(partner) {
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

            PartnerService
                .updatePartner(partner)
                .then(success, failed);
        }

        function upload() {
            if (vm.flow.files.length)
                PartnerService
                    .upload(vm.flow.files[0].file)
                    .then(function(response){

                        $scope.ngDialogData.metafields[0].value = response.media.name;

                        updatePartner($scope.ngDialogData);

                    }, function(){
                        console.log('failed :(');
                    }, function(progress){
                        vm.uploadProgress = progress;
                    });
            else
                updatePartner($scope.ngDialogData);
        }
    }
})();
