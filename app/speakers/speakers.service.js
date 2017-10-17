(function () {
    'use strict';

    angular
        .module('main')
        .service('SpeakersService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope,
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY, MEDIA_URL) {
            
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            this.speaker = {
                "title": null,
                "type_slug": "speakers",
                "metafields": [
                    {
                        "value":null,
                        "key": "profession",
                        "title": "Profession",
                        "type": "text"
                    },
                    {
                        "value": null,
                        "key": "avatar",
                        "title": "Avatar",
                        "type": "file"
                    }
                ]
            };

            this.getSpeakers = function () {
                return $http.get(URL + BUCKET_SLUG + '/object-type/speakers', {
                    params: {
                        limit: 100,
                        read_key: READ_KEY
                    }
                });
            };
            this.getSpeakerBySlug = function (slug) {
                return $http.get(URL + BUCKET_SLUG + '/object/' + slug, {
                    params: {
                        read_key: READ_KEY
                    }
                });
            };
            this.updateSpeaker = function (speaker) {
                speaker.write_key = WRITE_KEY;

                return $http.put(URL + BUCKET_SLUG + '/edit-object', speaker);
            };
            this.removeSpeaker = function (slug) {
                return $http.delete(URL + BUCKET_SLUG + '/' + slug, {
                    ignoreLoadingBar: true,
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    data: {
                        write_key: WRITE_KEY
                    }
                });
            };
            this.createSpeaker = function (speaker) {
                speaker.write_key = WRITE_KEY;
                
                return $http.post(URL + BUCKET_SLUG + '/add-object', speaker);
            };
            this.upload = function (file) {
                var fd = new FormData();

                fd.append('media', file);
                fd.append('write_key', WRITE_KEY);

                var defer = $q.defer();

                var xhttp = new XMLHttpRequest();

                xhttp.upload.addEventListener("progress",function (e) {
                    defer.notify(parseInt(e.loaded * 100 / e.total));
                });
                xhttp.upload.addEventListener("error",function (e) {
                    defer.reject(e);
                });

                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState === 4) {
                        defer.resolve(JSON.parse(xhttp.response)); //Outputs a DOMString by default
                    }
                };

                xhttp.open("post", MEDIA_URL, true);

                xhttp.send(fd);
                
                return defer.promise;
            }
        });
})();  