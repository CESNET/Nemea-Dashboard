var app = angular.module("pizza", ['ngRoute', 'ngMaterial', 'ngAnimate']);

app.config(config);

function config($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			controller: 'homeController',
			templateUrl: '/pizza/views/home.html'
		})
		.otherwise({
			redirectTo: '/'
		});
};

app.controller('homeController', ['$scope', '$location', 'people', function($scope, $location, people){
	var pizzaType = "";

	$scope.title = "Pizza Time!";
	people.success(function(data){
		$scope.people = data;	
	});

	$scope.selectedItemChange = function(data) {
		$scope.pizzaType = pizzaType;
		console.log("data: " + JSON.stringify(data));
		console.log($scope.pizza.type);

		//$scope.people[data.name].type = $scope.pizza.type;

		//aconsole.log(JSON.stringify($scope.people]));
	};



//	$location.path("pizza/")

}]);

app.factory('people', ['$http', function($http) {
	return $http.get('/pizza/people.json')
		.success(function(data) {
			//console.log(data);
			return data;
		});
	//	.error(console.log('Cannot retrieve data'));
}]);