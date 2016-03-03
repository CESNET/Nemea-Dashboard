app.controller('loginController', function($scope, $location, $log, user) {
	$scope.title = "Login to Nemea Dashboard";
	$scope.loginBtn = "Login";
    
    $scope.submit = function(cred) {
		$scope.loginBtn = "Authenticating...";
        $scope.loginBtnDisabled = true;

        user.auth(cred)
        .success(function(data) {
            $location.path('/');    
        })
        .error(function(msg) {
            $scope.error_mes = msg;
            $scope.loginBtn = "Login"
            $scope.loginBtnDisabled = false;
        })
    }


    var pattern = Trianglify({
        width: window.innerWidth,
        height: window.innerHeight,
        x_colors: 'GnBu',
        y_colors: 'GnBu',
        cell_size: 50

    });

    console.log(pattern);
    document.getElementById("login").appendChild(pattern.canvas())


		
		/*loginAuth.fetchUser(user)
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
		});*/
});


