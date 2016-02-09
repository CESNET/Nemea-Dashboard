app.service('api', ['$http', '$log', '$mdToast', function($http, $log, $mdToast, $localStorage) {

	var addr = "http://benefizio.liberouter.org:5555/v2/events/";

    this.config = function() {
        $http.get('http://benefizio.liberouter.org:5555/config').success(function(data) {
            this.addr = data.host + ':' + data.port + data.events;
            $localStorage['nd-config'] = data;
            alert(data);
        });
    }

    this.get = function(url, info) {
		return $http.get(addr + url)
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

}]);

