app.controller('eventController', function($scope, $routeParams, $http, api) {

        $scope.id = $routeParams;
        $scope.showPlain = true;

        $scope.geo = [];

        $scope.back = function() {
            window.history.back()
        }

        api.get('id/' + $routeParams['id']).success(function(data) {
            $scope.data = data;

            //var bounds = new google.maps.LatLngBounds();

            if (($scope.data.Source != undefined && $scope.data.Target != undefined) && 
                ($scope.data.Source[0].IP4 && $scope.data.Target[0].IP4)) {
                $http.get('http://freegeoip.net/json/' + $scope.data.Target[0].IP4[0]).success(function(data) {
                    
                    data['type'] = "Target";
                    $scope.geo.push(data);
                    //var latlng = new google.maps.LatLng(data.latitude, data.longitude);
                    //bounds.extend(latlng);

                })
                $http.get('http://freegeoip.net/json/' + $scope.data.Source[0].IP4[0]).success(function(data) {
                    data['type'] = "Source";
                    $scope.geo.push(data);
                    //var latlng = new google.maps.LatLng(data.latitude, data.longitude);
                    //bounds.extend(latlng);
                })
            }
            else if ($scope.data.Source == undefined || $scope.data.Source[0].IP4 == undefined) {
                $http.get('http://freegeoip.net/json/' + $scope.data.Target[0].IP4[0]).success(function(data) {
                    data['type'] = "Target";
                    $scope.geo.push(data);
                })
            } else {
                $http.get('http://freegeoip.net/json/' + $scope.data.Source[0].IP4[0]).success(function(data) {
                    data['type'] = "Source";
                    $scope.geo.push(data);
                })
            }
        })
        

});
