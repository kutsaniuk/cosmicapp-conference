(function () {
    'use strict';

    angular
        .module('main')
        .service('AboutService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope,
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY, MEDIA_URL) {
            
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            this.getPages = function (params) {
                return $http.get(URL + BUCKET_SLUG + '/object-type/pages', {
                    params: {
                        limit: 100,
                        read_key: READ_KEY
                    }
                });
            };
            this.updatePages = function (page) {
                page.write_key = WRITE_KEY;

                return $http.put(URL + BUCKET_SLUG + '/edit-object', page);
            };
        });
})();  