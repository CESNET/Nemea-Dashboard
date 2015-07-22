app.controller('loginController', ['$scope', '$location', '$log', 'loginAuth', function($scope, $location, $log, loginAuth) {
	$scope.title = "Login!";
	$scope.loginBtn = "Login";

	$scope.hitSubmit = function(user){

		$scope.loginBtn = "Please wait...";
		
		loginAuth.fetchUser(user)
		.success(function(data) {

			if (data["success"] == true) {
				$log.info(data);	
				$scope.loginBtn = "Success";
				$location.path("/");			
			}
			else {
				$log.error("error - bad password");
				$scope.error_mes = "Bad password";
				$scope.loginBtn = "Login";
			}
		});
	};
}]);