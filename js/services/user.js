app.service('user', function($localStorage, $http, $mdToast, $location){
    var cache = null;

    var dashboard = [];

    this.config = function() {
        return $localStorage["dashboard"];
    }

    this.jwt = function() {
        return $localStorage["jwt"];
    }

    this.auth = function(user) {
        return $http.post("http://benefizio.liberouter.org:5555/v2/users/auth", angular.toJson(user))
        .success(function(data) {
            $localStorage["token"] = data["jwt"];
            
            // TODO: differentiate between config and jwt >> duplicity
            delete $localStorage["dashboard"];
            $localStorage["dashboard"] = data["settings"];
            return;
        })
        .error(function(error, status) {
            console.log(error);
            console.log(status)
            // Let it be handled by controller
            return error;
        })
    }

    this.put = function(data, info) {
        return $http({
            url : "http://benefizio.liberouter.org:5555/v2/users/", 
            method : "PUT",
            data : angular.toJson(data),
            headers : {
                'Authorization' : $localStorage["token"]
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
            })
    }
    
    // Logout user
    // Remove JWT from localStorage and delete session on server
    this.logout = function() {
        var user = $localStorage["token"];

        return $http({
            url : "http://benefizio.liberouter.org:5555/v2/users/logout",
            method : "DELETE",
            headers : {
                'Authorization' : $localStorage["token"]
                }
            })
            .success(function(data) {
                $location.path("/login");
                delete $localStorage["token"];
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
                delete $localStorage["token"];
                $mdToast.show(
                    $mdToast
                        .simple()
                        .textContent('Logout failed on server side, but you are logged out')
                        .position("top right")
                        .hideDelay(3000)
                );
            });
    }

});
