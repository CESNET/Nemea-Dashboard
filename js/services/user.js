app.service('user', function($localStorage, $http){
    var cache = null;

    var config = [];

    this.auth = function(user) {
        return $http.post("http://benefizio.liberouter.org:5555/v2/users/auth", angular.toJson(user))
        .success(function(data) {
            console.log($localStorage["token"])
            $localStorage["token"] = data["jwt"];
            
            // TODO: differentiate between config and jwt >> duplicity
            config = data;
            return;
        })
        .error(function(error, status) {
            console.log(error);
            console.log(status)
            // Let it be handled by controller
            return error;
        })
    }

    this.put = function(url, data, info) {
        return $http.put(addr + url, JSON.stringify(data))
            .success(function(data) {
                if (info) {
                    $mdToast.show(
                        $mdToast
                            .simple()
                            .textContent('User settings updated')
                            .position("top right")
                            .hideDelay(5000)
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
                        .hideDelay(5000)
                        .theme("error-toast")
                );
            })
    }

    this.config = function() {
        $http.get();
    }
});
