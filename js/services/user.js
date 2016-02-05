app.service('user', function($localStorage, $http){
    var cache = null;

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
            .error(function() {
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
