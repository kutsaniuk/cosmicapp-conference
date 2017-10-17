(function () {
    'use strict';

    angular
        .module('main')
        .service('RegisterService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope,
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY, MEDIA_URL) {
            
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            
            this.register = function (_member) {

                var member = {
                    write_key: WRITE_KEY,
                    slug: "test",
                    title: _member.first_name + ' ' + _member.last_name,
                    type_slug: "members",
                    metafields: [
                        {
                            "value": _member.first_name,
                            "key": "first_name",
                            "title": "First Name",
                            "type": "text",
                            "children": null
                        },
                        {
                            "value": _member.last_name,
                            "key": "last_name",
                            "title": "Last Name",
                            "type": "text",
                            "children": null
                        },
                        {
                            "value": _member.email,
                            "key": "email",
                            "title": "Email",
                            "type": "text",
                            "children": null
                        },
                        {
                            "value": _member.phone,
                            "key": "phone",
                            "title": "Phone",
                            "type": "text",
                            "children": null
                        },
                        {
                            "value": _member.address,
                            "key": "address",
                            "title": "Address",
                            "type": "text",
                            "children": null
                        },
                        {
                            "value": _member.zip_code,
                            "key": "zip_code",
                            "title": "Zip Code",
                            "type": "text",
                            "children": null
                        },
                        {
                            "value": _member.city,
                            "key": "city",
                            "title": "City",
                            "type": "text",
                            "children": null
                        },
                        {
                            "value": _member.program,
                            "key": "program",
                            "title": "Program",
                            "type": "text",
                            "children": null
                        }
                    ]
                };
                
                return $http.post(URL + BUCKET_SLUG + '/add-object', member);
            };
        });
})();  