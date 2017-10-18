(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminPartnerAdd', AdminPartnerAdd);

    function AdminPartnerAdd(PartnerService, Notification, $log, $scope, MEDIA_URL, ngDialog) {
        var vm = this;

        vm.save = upload;

        vm.uploadProgress = 0;
        vm.action = 'add';

        vm.partner = {};
        vm.flow = {};

        vm.flowConfig = {
            target: MEDIA_URL,
            singleFile: true
        };

        function createPartner(partner) {
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

            PartnerService
                .createPartner(partner)
                .then(success, failed);
        }

        function upload() {
            if (vm.flow.files.length)
                PartnerService
                    .upload(vm.flow.files[0].file)
                    .then(function(response){
    
                        $scope.ngDialogData.metafields[0].value = response.media.name;

                        createPartner($scope.ngDialogData);
    
                    }, function(){
                        console.log('failed :(');
                    }, function(progress){
                        vm.uploadProgress = progress;
                    });
        }

    }
})();
