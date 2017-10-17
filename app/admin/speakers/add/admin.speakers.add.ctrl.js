(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminSpeakersAdd', AdminSpeakersAdd);

    function AdminSpeakersAdd($state, $timeout, SpeakersService, Notification, $log, $scope, MEDIA_URL, ngDialog) {
        var vm = this;

        vm.save = upload;

        vm.uploadProgress = 0;
        vm.action = 'add';

        vm.speaker = {};
        vm.flow = {};

        vm.flowConfig = {
            target: MEDIA_URL,
            singleFile: true
        };

        function createSpeaker(speaker) {
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
            
            SpeakersService
                .createSpeaker(speaker)
                .then(success, failed);
        }

        function upload() {
            if (vm.flow.files.length)
                SpeakersService
                    .upload(vm.flow.files[0].file)
                    .then(function(response){
    
                        $scope.ngDialogData.metafields[1].value = response.media.name;

                        createSpeaker($scope.ngDialogData);
    
                    }, function(){
                        console.log('failed :(');
                    }, function(progress){
                        vm.uploadProgress = progress;
                    });
        }

    }
})();
