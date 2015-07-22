app.factory('menu', ['$http', function($http) {
	return $http.get('json/menu.json')
		.success(function(data) {
			return data;
		});
	//	.error(console.log('Cannot retrieve data'));
}]);

app.factory('jsondata', ['$http', function($http) {
	return $http.get('/json/testfile_100.json')
		.success(function(data) {
			return data;
		});
	//	.error(console.log('Cannot retrieve data'));
}]);

app.directive("sidebarMenu", function() {
	return {
		scope: {
			section: '='
		},
		templateUrl: 'partials/sidebar-menu.html'
	};
});

app.directive("topbarMenu", function() {
	return {
		scope: {
			section: '='
		},
		templateUrl: 'partials/topbar-menu.html'
	};
});

app.directive("boxes", function() {
	return {
		scope: {
			section: '='
		},
		templateUrl: 'partials/boxes.html'
	};
});

var loginService = angular.module('loginService', []);

loginService.factory('loginAuth', ['$http', function($http){

	var loginAuth = {};

	loginAuth.fetchUser = function (user) {
		return $http.post('test.php', user);
	};

	return loginAuth;
}])