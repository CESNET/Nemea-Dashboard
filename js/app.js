var app = angular.module('gui', ['ngAnimate', 'ngMaterial', 'ngRoute', 'ngMessages', 'nvd3', 'ngStorage', 'ngMap']);

app.config(config);

function config($routeProvider, $mdThemingProvider) {
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
            templateUrl : 'views/events.html'
        })
        .when('/events/:id', {
            controller: 'eventController',
            templateUrl : 'views/event.html'
        })
		.otherwise({
			redirectTo: '/login'
		});

    $mdThemingProvider.theme('default').primaryPalette('light-blue').accentPalette('orange');

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

checkLogin = function($rootScope, $location, localStorageService) {
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

		if (localStorageService.get("loggedIn")) {
    		//$location.path("/");
    		console.log("correct")	
    	}
    	else {
    		$location.path("/login");
    	}

	return false;
}

//take all whitespace out of string
app.filter('nospace', function () {
      return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
      };
    });


