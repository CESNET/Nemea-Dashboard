app.service('user', function($http, $mdToast, $location, $log, CONFIG){
    var cache = null;

    var dashboard = [];

	var addr = CONFIG["host"] + ":" + CONFIG["port"] + "/" + CONFIG["version"] + "/users/";

    this.config = function() {
        return JSON.parse(window.localStorage["dashboard"]);
    }

    this.jwt = function() {
        var token = window.localStorage['token'];
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    this.auth = function(user) {
        console.log(addr);
        return $http.post(addr + "auth", angular.toJson(user))
        .then(
			function successCallback(data) {
				console.log("SUCCESS");
				window.localStorage["token"] = data['data']["jwt"];
				$log.info(data.data)

				// TODO: differentiate between config and jwt >> duplicity
				delete window.localStorage["dashboard"];
				window.localStorage["dashboard"] = JSON.stringify(data['data']["settings"]);
				return data;
			},
			function errorCallback(error, status) {
				console.log(error);
				console.log(status)
				// Let it be handled by controller
				return error;
			}
		)
    }

    this.put = function(data, info) {
        return $http({
            url : addr, 
            method : "PUT",
            data : angular.toJson(data),
            headers : {
                'Authorization' : window.localStorage["token"]
            }
            })
            .success(function(data) {
                if (info) {
                    $mdToast.show(
                        $mdToast
                            .simple()
                            .textContent('User settings updated')
                            .position("top right")
                            .hideDelay(3000)
                            .theme("success-toast")
                    );
                }
                return data;        
            })
            .error(function(msg, status) {
            	$log.error('Something went wrong sending user data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Something went wrong')
                        .position("top right")
                        .hideDelay(3000)
                        .theme("error-toast")
                );
                console.log(msg);
                return msg;
            })
    }
    
    // Logout user
    // Remove JWT from localStorage and delete session on server
    this.logout = function() {
        var user = window.localStorage["token"];

        return $http({
            url : addr + "logout",
            method : "DELETE",
            headers : {
                'Authorization' : window.localStorage["token"]
                }
            })
            .success(function(data) {
                $location.path("/login");
                delete window.localStorage["token"];
                delete window.localStorage["dashboard"];
                delete window.localStorage["timestamp"];
                $mdToast.show(
                    $mdToast
                        .simple()
                        .textContent('Logout successfull')
                        .position("top right")
                        .hideDelay(3000)
                );
                return;        
            })
            .error(function(error, msg) {
                $location.path("/login");
                delete window.localStorage["token"];
                delete window.localStorage["dashboard"];
                delete window.localStorage["timestamp"];
                $mdToast.show(
                    $mdToast
                        .simple()
                        .textContent('Logout failed on server side, but you are logged out')
                        .position("top right")
                        .hideDelay(3000)
                );
            });
    }

    this.get = function(allusers) {
        var user = window.localStorage["token"];
        
        if (allusers) {
            return $http({
                url : addr,
                method : "GET",
                headers : {
                    'Authorization' : user
                }
            })
            .success(function(data_raw) {
                console.log(data_raw)
                return data_raw;
            })
            .error(function(error, msg) {
                $mdToast.show(
                    $mdToast
                        .simplet()
                        .textContent("Cannot fetch users from database")
                        .position("top right")
                        .hideDelay(3000)
                        .theme("error-toast")
                )
            });
        }

        return this.jwt();
    }


    this.post = function(userData) {
        var user = window.localStorage["token"];
        
        return $http({
            url : addr,
            method : "POST",
            data : angular.toJson(userData),
            headers : {
                'Authorization' : user
            }
        })
        .success(function(data) {
            return data;
        })
        .error(function(error, msg) {
            $mdToast.show(
                $mdToast
                    .simplet()
                    .textContent("Cannot create user")
                    .position("top right")
                    .hideDelay(3000)
                    .theme("error-toast")
            )
        });
    }

     this.delete = function(userId) {
        var user = windown.localStorage["token"];
        console.log(userId)
        
        return $http({
            url : addr,
            method : "DELETE",
            params : {"userId" : userId},
            headers : {
                'Authorization' : user
            }
        })
        .success(function(data) {
            return data;
        })
        .error(function(error, msg) {
            $mdToast.show(
                $mdToast
                    .simplet()
                    .textContent("Cannot delete user")
                    .position("top right")
                    .hideDelay(3000)
                    .theme("error-toast")
            )
        });
    }



});
