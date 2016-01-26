app.controller('loginController', function($scope, $location, $log, loginAuth, $rootScope, localStorageService) {
	$scope.title = "Login!";
	$scope.loginBtn = "Login";
    
    $scope.submit = function(user) {
        console.log(user);
    }

	$scope.hitSubmit = function(user){
        console.log("test");

		$scope.loginBtn = "Please wait...";
		
		loginAuth.fetchUser(user)
		.success(function(data) {

			$log.info(data);

			if (data["success"] == true) {
				//$log.info(data);	
				$scope.loginBtn = "Success";
				$location.path("/");
				localStorageService.set('loggedIn', true);
				localStorageService.set('loggedIn.pw', sha256_digest(data.password));	
			}
			else {
				$log.error("error - bad password");
				$scope.error_mes = "Bad password";
				$scope.loginBtn = "Login";
				loginCorrect = false;
				localStorageService.set('loggedIn', false);	
			}
		});
	};
});
