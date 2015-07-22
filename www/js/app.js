var app = angular.module('gui', ['ngAnimate', 'ngMaterial', 'ngRoute', 'loginService', 'ngMessages', 'nvd3']);

app.config(config);

function config($routeProvider, $locationProvider) {
	$routeProvider
		.when('/login', {
			controller: 'loginController',
			templateUrl: 'views/login.html',
			isLogin: true
		})
		.when('/', {
			controller: 'homeController',
			templateUrl: 'views/home.html'
		})
		.otherwise({
			redirectTo: '/login'
		});

	//$locationProvider.html5Mode(true);
};

//take all whitespace out of string
app.filter('nospace', function () {
      return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
      };
    });
