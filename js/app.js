var app = angular.module('gui', ['ngAnimate', 'ngMaterial', 'ngRoute', 'loginService', 'ngMessages', 'nvd3', 'LocalStorageModule']);

app.config(config);

var db = new PouchDB('http://localhost:5984/users');

db.info().then(function (info) {
  console.log(info);
})

function config($routeProvider, $locationProvider, localStorageServiceProvider) {
	$routeProvider
		.when('/login', {
			controller: 'loginController',
			templateUrl: 'views/login.html',
			resolve: {
				isLogin: checkLogin
			}
		})
		.when('/', {
			controller: 'homeController',
			templateUrl: 'views/home.html',
			resolve: {
				isLogin: checkLogin
			}
		})
		.when('/user', {
			controller: 'userController',
			templateUrl: 'views/login.html',
			resolve: {
				isLogin: checkLogin
			}
		})
		.otherwise({
			redirectTo: '/login'
		});

	localStorageServiceProvider
		.setPrefix('nemea-dashboard')
		//PRODUCTION
		//.setStorageCookieDomain(window.location)
		//DEV
		.setStorageCookieDomain('')
		;

	//$locationProvider.html5Mode(true);
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
	console.log("login: " + loginCorrect);
	console.log(localStorageService.keys());
	if (localStorageService.keys() == '') {
		localStorageService.set('loggedIn', null);
	}

	//$rootScope.$on("$locationChangeStart", function(event){

    	if (localStorageService.get("loggedIn")) {
    		//$location.path("/");
    		console.log("correct")	
    	}
    	else {
    		$location.path("/login");
    	}
	//})

	return false;
}

//take all whitespace out of string
app.filter('nospace', function () {
      return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
      };
    });

// CONSTANTS

app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
