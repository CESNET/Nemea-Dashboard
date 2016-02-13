var app = angular.module('gui', ['ngAnimate', 'ngMaterial', 'ngRoute', 'ngMessages', 'nvd3', 'ngStorage', 'ngMap', 'gridster']);

app.config(config);

function config($routeProvider, $mdThemingProvider, $httpProvider, $localStorageProvider) {
	$routeProvider
		.when('/login', {
			controller: 'loginController',
			templateUrl: 'views/login.html',
		})
		.when('/', {
			controller: 'homeController',
			templateUrl: 'views/home.html',
		})
		.when('/user', {
			controller: 'userController',
			templateUrl: 'views/login.html',
		})
        .when('/events', {
            controller : 'eventsController',
            templateUrl : 'views/events.html',
            reloadOnSearch : false
        })
        .when('/events/:id', {
            controller: 'eventController',
            templateUrl : 'views/event.html'
        })
		.otherwise({
			redirectTo: '/login'
		});

    $mdThemingProvider.theme('default').primaryPalette('light-blue').accentPalette('orange');

    $httpProvider.interceptors.push('notAllowedInterceptor');
    $localStorageProvider
        .setKeyPrefix('nd-');
	// localStorageServiceProvider
	// 	.setPrefix('nemea-dashboard')
	// 	//PRODUCTION
	// 	//.setStorageCookieDomain(window.location)
	// 	//DEV
	// 	.setStorageCookieDomain('')
	// 	;

//	$locationProvider.html5Mode(true);
};

//take all whitespace out of string
app.filter('nospace', function () {
      return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
      };
    });

// Always check for a JWT
app.run(function(user, $localStorage, $location, $rootScope, $log) {
	$rootScope.$on("$locationChangeStart", function(event) {
        if ($localStorage["token"] == undefined) {
            $log.info("no token found, redirecting to /login")
            $location.path("/login");
        }
    })
})

// HTTP interceptor injected in config
app.factory('notAllowedInterceptor', function($log, $localStorage, $location, $injector, $q) {
    var notAllowedInterceptor = {
        // Intercept $http errors
        responseError : function(response) {
            // Check for 401 error
            if (response.status == 401) {
                $log.error('You are not allowed to access, redirecting to /login');
                // Delete exisiting JWT from localStorage 
                delete $localStorage["token"];
                // Redirect to login
                $location.path('/login');
            }
            // Return promise so we can handle the error further
            return $q.reject(response);
        }
    }
    return notAllowedInterceptor;
})
