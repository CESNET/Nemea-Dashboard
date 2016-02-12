var app = angular.module('gui', ['ngAnimate', 'ngMaterial', 'ngRoute', 'ngMessages', 'nvd3', 'ngStorage', 'ngMap', 'gridster']);

app.config(config);

function config($routeProvider, $mdThemingProvider, $httpProvider, $localStorageProvider) {
	$routeProvider
		.when('/login', {
			controller: 'loginController',
			templateUrl: 'views/login.html',
			resolve: {
				//isLogin: checkLogin
			}
		})
		.when('/', {
			controller: 'homeController',
			templateUrl: 'views/home.html',
			resolve: {
				//isLogin: checkLogin
			}
		})
		.when('/user', {
			controller: 'userController',
			templateUrl: 'views/login.html',
			resolve: {
				//isLogin: checkLogin
			}
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
//	$httpProvider.defaults.headers.common['Authorization'] = "autentizace";
	// localStorageServiceProvider
	// 	.setPrefix('nemea-dashboard')
	// 	//PRODUCTION
	// 	//.setStorageCookieDomain(window.location)
	// 	//DEV
	// 	.setStorageCookieDomain('')
	// 	;

//	$locationProvider.html5Mode(true);
};

// $rootScope.$on('$routeChangeStart', function (event, next) {
//         var userAuthenticated = false; /* Check if the user is logged in */

//         if (!userAuthenticated && !next.isLogin) {
//             $rootScope.savedLocation = $location.url();

//             $location.path('/login');
//         }
//     });

var loginCorrect = null;

checkLogin = function($rootScope, $location, localStorageService, $rootScope) {
	// console.log("login: " + loginCorrect);
	// console.log(localStorageService.keys());
	// if (localStorageService.keys() == '') {
	// 	localStorageService.set('loggedIn', null);
	// }

	//$rootScope.$on("$locationChangeStart", function(event){

    	// if (localStorageService.get("loggedIn")) {
    	// 	//$location.path("/");
    	// 	console.log("correct")	
    	// }
    	// else {
    	// 	$location.path("/login");
    	// }
	//})

	$rootScope.$on("$locationChangeStart", function(event){
		if (localStorageService.get("loggedIn")) {
    		//$location.path("/");
    		console.log("correct")	
    	}
    	else {
    		$location.path("/login");
    	}
    })

	return false;
}

//take all whitespace out of string
app.filter('nospace', function () {
      return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
      };
    });


app.run(function(user, $localStorage, $location, $rootScope, $log) {
	$rootScope.$on("$locationChangeStart", function(event) {
        if ($localStorage["token"] == undefined) {
            $log.info("no token found, redirecting to /login")
            $location.path("/login");
        }
    })
})


app.factory('notAllowedInterceptor', function($log, $localStorage, $location, $injector) {
    var notAllowedInterceptor = {
        responseError : function(response) {
            var $http = $injector.get('$http');
            if (response.status == 401) {
                $log.error('You are not allowed to access');
                $log.error(response);
                delete $localStorage["token"];
                $location.path('/login');
            }

            
            return $http(response);
        }
    }

    return notAllowedInterceptor;
})
