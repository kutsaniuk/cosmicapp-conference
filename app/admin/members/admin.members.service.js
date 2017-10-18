(function () {
    'use strict';

    angular
        .module('main')
        .service('AdminMembersService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope,
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY, MEDIA_URL) {
            
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            this.member = {
                "title": null,
                "type_slug": "members",
                "metafields": [
                    {
                        "value": null,
                        "key": "first_name",
                        "title": "First Name",
                        "type": "text",
                        "children": null
                    },
                    {
                        "value": null,
                        "key": "last_name",
                        "title": "Last Name",
                        "type": "text",
                        "children": null
                    },
                    {
                        "value": null,
                        "key": "email",
                        "title": "Email",
                        "type": "text",
                        "children": null
                    },
                    {
                        "value": null,
                        "key": "phone",
                        "title": "Phone",
                        "type": "text",
                        "children": null
                    },
                    {
                        "value": null,
                        "key": "address",
                        "title": "Address",
                        "type": "text",
                        "children": null
                    },
                    {
                        "value": null,
                        "key": "zip_code",
                        "title": "Zip Code",
                        "type": "text",
                        "children": null
                    },
                    {
                        "value": null,
                        "key": "city",
                        "title": "City",
                        "type": "text",
                        "children": null
                    },
                    {
                        "value": null,
                        "key": "program",
                        "title": "Program",
                        "type": "text",
                        "children": null
                    }
                ]
            };

            this.getMembers = function () {
                return $http.get(URL + BUCKET_SLUG + '/object-type/members', {
                    params: {
                        limit: 100,
                        read_key: READ_KEY
                    }
                });
            };
            this.getMemberBySlug = function (slug) {
                return $http.get(URL + BUCKET_SLUG + '/object/' + slug, {
                    params: {
                        read_key: READ_KEY
                    }
                });
            };
            this.updateMember = function (member) {
                member.write_key = WRITE_KEY;
                member.title = member.first_name + ' ' + member.last_name;

                return $http.put(URL + BUCKET_SLUG + '/edit-object', member);
            };
            this.removeMember = function (slug) { 
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
            this.createMember = function (member) {
                member.write_key = WRITE_KEY;
                member.title = member.first_name + ' ' + member.last_name;

                return $http.post(URL + BUCKET_SLUG + '/add-object', member);
            };
        });
})();  