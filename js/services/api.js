app.service('api', function($http, $log, $mdToast, $localStorage) {

	var addr = "http://benefizio.liberouter.org:5555/v2/events/";

    this.auth = function() {
        return $localStorage["token"];
    }

    this.config = function() {
        $http.get('http://benefizio.liberouter.org:5555/config').success(function(data) {
            this.addr = data.host + ':' + data.port + data.events;
            $localStorage['config'] = data;
            alert(data);
        });
    }

    this.get = function(url, params, info) {
		return $http({
            url : addr + url,
            method : "GET",
            params : params,
            headers : {
                'Authorization' : this.auth()
            }
        })
        .success(function(data) {
            if (info != undefined) {
                $mdToast.show(
                    $mdToast
                        .simple()
                        .textContent('Data successully loaded')
                        .position("top right")
                        .hideDelay(5000)
                        .theme("success-toast")
                );
            }

            return data;
        })
        .error(function() {
            $log.error('Cannot fetch data');
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Something went wrong')
                    .position("top right")
                    .hideDelay(5000)
                    .theme("error-toast")
            );

        });
    }

    this.post = function(url, data, info) {
        return $http.post(addr + url, JSON.stringify(data))
            .success(function(data) {
                if (info) {
                    $mdToast.show(
                        $mdToast
                            .simple()
                            .textContent('Data successfully loaded')
                            .position("top right")
                            .hideDelay(5000)
                            .theme("success-toast")
                    );
                }
                return data;        
            })
            .error(function() {
            	$log.error('Cannot fetch data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Something went wrong')
                        .position("top right")
                        .hideDelay(5000)
                        .theme("error-toast")
                );
            })
    }

    this.put = function(url, data, info) {
        return $http.put(addr + url, JSON.stringify(data))
            .success(function(data) {
                if (info) {
                    $mdToast.show(
                        $mdToast
                            .simple()
                            .textContent('Data successfully loaded')
                            .position("top right")
                            .hideDelay(5000)
                            .theme("success-toast")
                    );
                }
                return data;        
            })
            .error(function() {
            	$log.error('Cannot fetch data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Something went wrong')
                        .position("top right")
                        .hideDelay(5000)
                        .theme("error-toast")
                );
            })
    }

//    this.put = function

});


