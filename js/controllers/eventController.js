app.controller('eventController', function($scope, $routeParams, $http, api) {

        $scope.id = $routeParams;

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

app.filter('json2html', function($sce, $filter) {
    return function(input) {
        var html = ""
        angular.forEach(input, function(value, key) {
            html = html + "<div>";

            // The tuple is nested
            if ((typeof value) == 'object') {
                if ((typeof key) != 'number' && key != "$date")
                    html = html + "<em>" + key + "</em>: ";
                html = html + "<div class=\"sub\">" + $filter('json2html')(value) + "</div>";
            } else {
                if ((typeof key != 'number') && key != "$date")
                    html = html + "<em>" + key + "</em>: ";
                
                // Check if it is date (I know, it is sooooo dirty)
                if (value > 1000000000000)
                    html = html + "<span>" + $filter('date')(value,'yyyy/MM/dd H:mm:ss') + "</span>";
                else
                    html = html + "<span>" + value + "</span>";
            }
            html = html + "</div>";
        })
        return $sce.trustAs('html', html);
    }     
});
