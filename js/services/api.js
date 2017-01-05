app.service('api', function($http, $log, $mdToast, PIECHART, CONFIG) {

	var addr = CONFIG["host"] + ":" + CONFIG["port"] + "/" + CONFIG["version"] + "/events/";

    this.auth = function() {
        return window.localStorage["token"];
    }

    this.config = function() {
        $http.get('http://benefizio.liberouter.org:5555/config').success(function(data) {
            this.addr = data.host + ':' + data.port + data.events;
            window.localStorage['config'] = data;
            alert(data);
        });
    }

    this.get = function(url, params, info, cache) {
		return $http({
            url : addr + url,
            method : "GET",
            params : params,
            headers : {
                'Authorization' : this.auth()
            }
        })
        .success(function(data) {
            if (info) {
                $mdToast.show(
                    $mdToast
                        .simple()
                        .textContent('Data successully loaded')
                        .position("top right")
                        .hideDelay(3000)
                        .theme("success-toast")
                );
            }

            if (cache)
                window.localStorage['timestamp'] = new Date();

            return data;
        })
        .error(function() {
            $log.error('Cannot fetch data');
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Cannot load data')
                    .position("top right")
                    .hideDelay(3000)
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
                            .hideDelay(3000)
                            .theme("success-toast")
                    );
                }
                return data;        
            })
            .error(function() {
            	$log.error('Cannot fetch data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Cannot fetch data')
                        .position("top right")
                        .hideDelay(3000)
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
                            .hideDelay(3000)
                            .theme("success-toast")
                    );
                }
                return data;        
            })
            .error(function() {
            	$log.error('Cannot fetch data');
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Cannot fetch data')
                        .position("top right")
                        .hideDelay(3000)
                        .theme("error-toast")
                );
            })
    }


});


