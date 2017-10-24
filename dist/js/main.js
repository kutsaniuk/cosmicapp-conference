angular.module("config", [])
.constant("BUCKET_SLUG", "conference")
.constant("URL", "https://api.cosmicjs.com/v1/")
.constant("MEDIA_URL", "https://api.cosmicjs.com/v1/conference/media")
.constant("READ_KEY", "PgNOjigV530fVrpsk8jCLdXCJxrsiBZNEOBWOqs9WE9qx3Ev89")
.constant("WRITE_KEY", "UTxihLqTWQFU9Hb5lj7bFBQvQrvGlcdbvVc1guNzT9lad63Xos")
.constant("STRIPE_KEY", "UTxihLqTWQFU9Hb5lj7bFBQvQrvGlcdbvVc1guNzT9lad63Xos");
 
(function () {
    'use strict';
    
    angular
        .module('main', [
            'ui.router', 
            'ui.bootstrap',
            'ngMask',
            'ngCookies',
            'ngRoute',
            'ngDialog',
            'ngAnimate',
            'cr.acl',
            'ui-notification',
            'ngFlash',
            'textAngular',
            'flow',
            'angular-loading-bar',
            'hl.sticky',

            'about',
            'home',
            'speakers',
            'schedule',
            'partner',
            'register',
            
            'admin',
            
            'config'
        ])
        .config(config)
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider', 'NotificationProvider'];
    function config($stateProvider, $urlRouterProvider, cfpLoadingBarProvider, NotificationProvider) {
        cfpLoadingBarProvider.includeSpinner = false;

        NotificationProvider.setOptions({
            startTop: 25,
            startRight: 25,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'top'
        });

        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            var $location = $injector.get("$location");
            var crAcl = $injector.get("crAcl");

            var state = "";
            
            switch (crAcl.getRole()) {
                case 'ROLE_ADMIN':
                    state = 'admin.pages';
                    break;
                default : state = 'main.home';
            }

            if (state) $state.go(state);
            else $location.path('/');
        });
 
        $stateProvider
            .state('main', {
                url: '/',
                abstract: true,
                templateUrl: '../views/main.html',
                controller: 'GlobalCtrl as vm',
                data: {
                    is_granted: ['ROLE_GUEST']
                }
            })
            .state('blog', {
                url: '/blog',
                templateUrl: '../blog.html'
            })
            .state('auth', {
                url: '/login',
                templateUrl: '../views/auth/login.html',
                controller: 'AuthCtrl as auth',
                onEnter: ['AuthService', 'crAcl', function(AuthService, crAcl) {
                    AuthService.clearCredentials();
                    crAcl.setRole();
                }],
                data: {
                    is_granted: ['ROLE_GUEST']
                }
            });
    } 

    run.$inject = ['$rootScope', '$cookieStore', '$state', 'crAcl', '$window'];
    function run($rootScope, $cookieStore, $state, crAcl, $window) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};

        crAcl
            .setInheritanceRoles({
                'ROLE_ADMIN': ['ROLE_ADMIN', 'ROLE_GUEST'],
                'ROLE_GUEST': ['ROLE_GUEST']
            });

        crAcl
            .setRedirect('auth');

        if ($rootScope.globals.currentUser) {
            crAcl.setRole('ROLE_ADMIN');
        }
        else {
            crAcl.setRole();
        }

        $rootScope.$on('$stateChangeSuccess', function (event, current, previous) {
            $window.document.title = current.title ? current.title + ' - ANGULAR SUMMIT' : 'ANGULAR SUMMIT';
        });

    }

})();
 
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AboutCtrl', AboutCtrl);

    function AboutCtrl($stateParams, AboutService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

        vm.toolbarEditor = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'bold', 'italics', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'html']
        ];

        vm.save = save;

        function init() {
            getPages();
        }
        
        function getPages() {
            function success(response) {
                vm.pages = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            AboutService
                .getPages()
                .then(success, error);
        } 

        function save(index) {
            function success() {
                Notification.primary('Update Page "' + vm.pages[index].title + '" success!');
            }

            function error(response) {
                $log.error(response.data);
            }

            AboutService
                .updatePages(vm.pages[index])
                .then(success, error);
        }
    }
})();

(function () {
    'use strict';
    
    angular
        .module('about', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.about', {
                url: 'about',
                templateUrl: '../views/about/about.html',
                controller: 'AboutCtrl as vm'
            });
    }
})();
  
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
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminCtrl', UserCtrl);

    function UserCtrl($rootScope, $scope, $state, AuthService, Flash, $log) {
        var vm = this;
        
        vm.currentUser = $rootScope.globals.currentUser.metadata;
        
        vm.logout = logout;

        function logout() {
            function success(response) {
                $state.go('auth');

                $log.info(response);
            }

            function failed(response) {
                $log.error(response);
            }

            AuthService
                .clearCredentials()
                .then(success, failed);
        }

        $scope.state = $state;

    }
})();

(function () {
    'use strict';
    
    angular
        .module('admin', [
            'admin.pages',
            'admin.speakers',
            'admin.schedules',
            'admin.partners',
            'admin.members'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('admin', {
                url: '/admin/',
                abstract: true,
                templateUrl: '../views/admin/admin.html',
                controller: 'GlobalCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }

})();
 
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl(crAcl, $state, AuthService, Flash, $log) {
        var vm = this;              

        vm.login = login;
        
        vm.showRegisterForm = false;
         
        vm.loginForm = null;
        
        vm.credentials = {};
        vm.user = {};

        function login(credentials) {
            function success(response) {
                function success(response) {
                    if (response.data.status !== 'empty') {
                        var currentUser = response.data.objects[0];

                        crAcl.setRole('ROLE_ADMIN');
                        AuthService.setCredentials(currentUser);
                        $state.go('admin.pages');
                    }
                    else
                        Flash.create('danger', 'Incorrect username or password');
                }

                function failed(response) {
                    $log.error(response);
                }

                if (response.data.status !== 'empty')
                    AuthService
                        .checkPassword(credentials)
                        .then(success, failed);
                else
                    Flash.create('danger', 'Incorrect username or password');

                $log.info(response);
            }

            function failed(response) {
                $log.error(response);
            }

            if (vm.loginForm.$valid)
                AuthService
                    .checkUsername(credentials)
                    .then(success, failed);
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('main')
        .service('AuthService', function ($http, 
                                          $cookieStore, 
                                          $q, 
                                          $rootScope, 
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY) {
            var authService = this;
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            authService.checkUsername = function (credentials) {
                return $http.get(URL + BUCKET_SLUG + '/object-type/users/search', {
                    params: {
                        metafield_key: 'email',
                        metafield_value_has: credentials.email,
                        limit: 1,
                        read_key: READ_KEY
                    }
                });
            };
            authService.checkPassword = function (credentials) {
                return $http.get(URL + BUCKET_SLUG + '/object-type/users/search', {
                    ignoreLoadingBar: true,
                    params: {
                        metafield_key: 'password',
                        metafield_value: credentials.password,
                        limit: 1,
                        read_key: READ_KEY
                    }
                });
            };
            authService.setCredentials = function (user) { 
                $rootScope.globals = {
                    currentUser: user
                };
                
                $cookieStore.put('globals', $rootScope.globals);
            };
            authService.clearCredentials = function () {
                var deferred = $q.defer();
                $cookieStore.remove('globals');

                if (!$cookieStore.get('globals')) {
                    $rootScope.globals = {};
                    deferred.resolve('Credentials clear success');
                } else {
                    deferred.reject('Can\'t clear credentials');
                }

                return deferred.promise;
            };
        });  
})();  
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('GlobalCtrl', GlobalCtrl);

    function GlobalCtrl($scope, Notification, $log, $rootScope, $state) {
        var vm = this;
        
        $scope.$state = $state;
        
        vm.title = $rootScope.title ? $rootScope.title + ' - ANGULAR SUMMIT' : 'ANGULAR SUMMIT';
        

    }
})(); 

(function () {
    'use strict';
    
    angular
        .module('home', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.home', {
                url: '',
                templateUrl: '../views/home/home.html',
                controller: 'AboutCtrl as vm'
            });
    }
})();
 
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('PartnerCtrl', PartnerCtrl); 

    function PartnerCtrl($stateParams, PartnerService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();
        
        vm.removePartner = removePartner;

        function init() {
            getPartners();
        }

        function getPartners() {
            function success(response) {
                vm.partners = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            PartnerService
                .getPartners()
                .then(success, error);
        }

        function removePartner(slug) {
            function success() {
                getPartners();
                Notification.primary('Removed!');
            }

            function error(response) {
                $log.error(response.data);
            }

            PartnerService
                .removePartner(slug)
                .then(success, error);
        }

    }
})();

(function () {
    'use strict';
    
    angular
        .module('partner', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.partner', {
                url: 'partner',
                title: 'Partner',
                templateUrl: '../views/partner/partner.html',
                controller: 'PartnerCtrl as vm'
            });
    }
})();
 
(function () {
    'use strict';

    angular
        .module('main')
        .service('PartnerService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope,
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY, MEDIA_URL) {
            
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            this.partner = {
                "type_slug": "partners",
                "title": "VNM",
                "metafields": [
                    {
                        "value": null,
                        "key": "image",
                        "title": "Image",
                        "type": "file"
                    }
                ]
            };

            this.getPartners = function () {
                return $http.get(URL + BUCKET_SLUG + '/object-type/partners', {
                    params: {
                        limit: 100,
                        read_key: READ_KEY
                    }
                });
            };
            this.getPartnerBySlug = function (slug) {
                return $http.get(URL + BUCKET_SLUG + '/object/' + slug, {
                    params: {
                        read_key: READ_KEY
                    }
                });
            };
            this.updatePartner = function (partner) {
                partner.write_key = WRITE_KEY;

                return $http.put(URL + BUCKET_SLUG + '/edit-object', partner);
            };
            this.removePartner = function (slug) {
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
            this.createPartner = function (partner) {
                partner.write_key = WRITE_KEY;
                
                return $http.post(URL + BUCKET_SLUG + '/add-object', partner);
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
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl(RegisterService, $log, Notification, $state) {
        var vm = this;

        vm.registerForm = null;
        vm.member = {};
        
        vm.register = register;
        
        function register() {
            function success() {
                Notification.primary('You registered!');
                $state.go('main.schedule');
            }

            function error(response) {
                $log.error(response.data);
            }

            RegisterService
                .register(vm.member)
                .then(success, error);
        }

    }
})();

(function () {
    'use strict';
    
    angular
        .module('register', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.register', {
                url: 'registration',
                title: 'Registration',
                templateUrl: '../views/register/register.html',
                controller: 'RegisterCtrl as vm'
            });
    }
})();
 
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
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('ScheduleCtrl', ScheduleCtrl);

    function ScheduleCtrl($stateParams, ScheduleService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

        vm.toolbarEditor = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'bold', 'italics', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'html']
        ];

        vm.save = save;

        function init() {
            getSchedules(); 
        }

        function getSchedules() {
            function success(response) {
                vm.schedules = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            ScheduleService
                .getSchedules()
                .then(success, error);
        }

        function save(schedule) {
            function success() {
                Notification.primary('Schedule updated!');
            }

            function error(response) {
                $log.error(response.data);
            }

            ScheduleService
                .updateSchedule(schedule)
                .then(success, error);
        }

    }
})();

(function () {
    'use strict';
    
    angular
        .module('schedule', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.schedule', {
                url: 'schedule',
                title: 'Schedule',
                templateUrl: '../views/schedule/schedule.html',
                controller: 'ScheduleCtrl as vm'
            });
    }
})();
 
(function () {
    'use strict';

    angular
        .module('main')
        .service('ScheduleService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope,
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY, MEDIA_URL) {
            
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            this.getSchedules = function () {
                return $http.get(URL + BUCKET_SLUG + '/object-type/schedules', {
                    params: {
                        limit: 100,
                        read_key: READ_KEY
                    }
                });
            };
            this.getScheduleBySlug = function (slug) {
                return $http.get(URL + BUCKET_SLUG + '/object/' + slug, {
                    params: {
                        read_key: READ_KEY
                    }
                });
            };
            this.updateSchedule = function (schedule) {
                schedule.write_key = WRITE_KEY;

                return $http.put(URL + BUCKET_SLUG + '/edit-object', schedule);
            };
            this.removeSchedule = function (slug) {
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
            this.createSchedule = function (schedule) {
                watch.write_key = WRITE_KEY;
                
                return $http.post(URL + BUCKET_SLUG + '/add-object', schedule);
            };
        });
})();  
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('SpeakersCtrl', SpeakersCtrl);

    function SpeakersCtrl($rootScope, SpeakersService, Notification, $log, MEDIA_URL, $state) {
        var vm = this;

        init();

        vm.removeSpeaker = removeSpeaker;

        function init() {
            getSpeakers();
        }

        function getSpeakers() {
            function success(response) {
                vm.speakers = response.data.objects;
            }

            function error(response) {
                $log.error(response.data);
            }

            SpeakersService
                .getSpeakers()
                .then(success, error);
        }

        function removeSpeaker(slug) {
            function success() {
                getSpeakers();
                Notification.primary('Removed!');
            }

            function error(response) {
                $log.error(response.data);
            }

            SpeakersService
                .removeSpeaker(slug)
                .then(success, error);
        }

    }
})();

(function () {
    'use strict';
    
    angular
        .module('speakers', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.speakers', {
                url: 'speakers',
                title: 'Speakers',
                templateUrl: '../views/speakers/speakers.html',
                controller: 'SpeakersCtrl as vm'
            });
    }
})();
 
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
(function () {
    'use strict';

    angular
        .module('main')
        .service('UserService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope, 
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY) {
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            this.getCurrentUser = function (ignoreLoadingBar) {
                return $http.get(URL + BUCKET_SLUG + '/object/' + $rootScope.globals.currentUser.slug, {
                    ignoreLoadingBar: ignoreLoadingBar,
                    params: {
                        read_key: READ_KEY
                    }
                });
            };
            this.getUser = function (slug, ignoreLoadingBar) {
                return $http.get(URL + BUCKET_SLUG + '/object/' + slug, {
                    ignoreLoadingBar: ignoreLoadingBar,
                    params: {
                        read_key: READ_KEY
                    }
                });
            };
            this.updateUser = function (user) {
                user.write_key = WRITE_KEY;

                return $http.put(URL + BUCKET_SLUG + '/edit-object', user, {
                    ignoreLoadingBar: false
                });
            };

        });  
})();  
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

(function () {
    'use strict';
    
    angular
        .module('admin.members', [
            'admin.members.edit',
            'admin.members.add'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.members', {
                url: 'members',
                templateUrl: '../views/admin/admin.members.html',
                controller: 'AdminMembersCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
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
(function () {
    'use strict';
    
    angular
        .module('admin.pages', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.pages', {
                url: 'pages',
                templateUrl: '../views/admin/admin.pages.html',
                controller: 'AboutCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
(function () {
    'use strict';
    
    angular
        .module('admin.partners', [
            'admin.partners.edit',
            'admin.partners.add'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.partners', {
                url: 'partners',
                templateUrl: '../views/admin/admin.partners.html',
                controller: 'PartnerCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
(function () {
    'use strict';
    
    angular
        .module('admin.schedules', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.schedules', {
                url: 'schedules',
                templateUrl: '../views/admin/admin.schedules.html',
                controller: 'ScheduleCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
(function () {
    'use strict';
    
    angular
        .module('admin.speakers', [
            'admin.speakers.edit',
            'admin.speakers.add'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.speakers', {
                url: 'speakers',
                templateUrl: '../views/admin/admin.speakers.html',
                controller: 'SpeakersCtrl as vm',
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
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

(function () {
    'use strict';
    
    angular
        .module('admin.members.add', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.members.add', {
                url: '/add',
                onEnter: [
                'ngDialog',
                'AdminMembersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, AdminMembersService, $stateParams, $state, $log) {
                    openDialog(AdminMembersService.member);
                        
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.members.edit.html',
                            data: data,
                            controller: 'AdminMembersAdd as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.members', {}, {reload: !data.value});
                                return true;
                        });
                    }
                }],
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
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

(function () {
    'use strict';
    
    angular
        .module('admin.members.edit', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.members.edit', {
                url: '/edit/:slug',
                onEnter: [
                'ngDialog',
                'AdminMembersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, AdminMembersService, $stateParams, $state, $log) {
                    getMember($stateParams.slug);
    
                    function getMember(slug) {
                        function success(response) {
                            openDialog(response.data.object);
                        }
    
                        function failed(response) {
                            $log.error(response);
                        }

                        AdminMembersService
                            .getMemberBySlug(slug)
                            .then(success, failed);
                    }
    
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.members.edit.html',
                            data: data,
                            controller: 'AdminMembersEdit as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.members', {}, {reload: !data.value});
                                return true;
                        });
                    }
                }],
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
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

(function () {
    'use strict';
    
    angular
        .module('admin.partners.add', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.partners.add', {
                url: '/add',
                onEnter: [
                'ngDialog',
                'PartnerService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, PartnerService, $stateParams, $state, $log) {
                    openDialog(PartnerService.partner);
                        
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.partners.edit.html',
                            data: data,
                            controller: 'AdminPartnerAdd as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.partners', {}, {reload: !data.value});
                                return true;
                        });
                    }
                }],
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
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

(function () {
    'use strict';
    
    angular
        .module('admin.partners.edit', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.partners.edit', {
                url: '/edit/:slug',
                onEnter: [
                'ngDialog',
                'PartnerService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, PartnerService, $stateParams, $state, $log) {
                    getPartner($stateParams.slug);
    
                    function getPartner(slug) {
                        function success(response) {
                            openDialog(response.data.object);
                        }
    
                        function failed(response) {
                            $log.error(response);
                        }

                        PartnerService
                            .getPartnerBySlug(slug)
                            .then(success, failed);
                    }
    
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.partners.edit.html',
                            data: data,
                            controller: 'AdminPartnersEdit as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.partners', {}, {reload: !data.value});
                                return true;
                        });
                    }
                }],
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
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

(function () {
    'use strict';
    
    angular
        .module('admin.speakers.add', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.speakers.add', {
                url: '/add',
                onEnter: [
                'ngDialog',
                'SpeakersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, SpeakersService, $stateParams, $state, $log) {
                    openDialog(SpeakersService.speaker);
                        
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.speakers.edit.html',
                            data: data,
                            controller: 'AdminSpeakersAdd as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.speakers', {}, {reload: !data.value});
                                return true;
                        });
                    }
                }],
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AdminSpeakersEdit', AdminSpeakersEdit);

    function AdminSpeakersEdit($state, SpeakersService, Notification, $log, $scope, MEDIA_URL, ngDialog) {
        var vm = this;

        vm.save = upload;

        vm.uploadProgress = 0;
        vm.action = 'edit';

        vm.speaker = {};
        vm.flow = {};

        vm.flowConfig = {
            target: MEDIA_URL,
            singleFile: true
        };

        function updateSpeaker(speaker) {
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

            SpeakersService
                .updateSpeaker(speaker)
                .then(success, failed);
        }

        function upload() {
            if (vm.flow.files.length)
                SpeakersService
                    .upload(vm.flow.files[0].file)
                    .then(function(response){

                        $scope.ngDialogData.metafields[1].value = response.media.name;

                        updateSpeaker($scope.ngDialogData);

                    }, function(){
                        console.log('failed :(');
                    }, function(progress){
                        vm.uploadProgress = progress;
                    });
            else
                updateSpeaker($scope.ngDialogData);
        }
    }
})();

(function () {
    'use strict';
    
    angular
        .module('admin.speakers.edit', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('admin.speakers.edit', {
                url: '/edit/:slug',
                onEnter: [
                'ngDialog',
                'SpeakersService',
                '$stateParams',
                '$state',
                '$log',
                function (ngDialog, SpeakersService, $stateParams, $state, $log) {
                    getSpeaker($stateParams.slug);
    
                    function getSpeaker(slug) {
                        function success(response) {
                            openDialog(response.data.object);
                        }
    
                        function failed(response) {
                            $log.error(response);
                        }

                        SpeakersService
                            .getSpeakerBySlug(slug)
                            .then(success, failed);
                    }
    
                    function openDialog(data) {
    
                        var options = {
                            templateUrl: '../views/admin/admin.speakers.edit.html',
                            data: data,
                            controller: 'AdminSpeakersEdit as vm',
                            showClose: true
                        };
    
                        ngDialog.open(options)
                            .closePromise
                            .then(function (data) {
                                $state.go('admin.speakers', {}, {reload: !data.value});
                                return true;
                        });
                    }
                }],
                data: {
                    is_granted: ['ROLE_ADMIN']
                }
            });
    }
    
})();
 