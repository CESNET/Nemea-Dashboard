app.controller('eventController', function($scope, $routeParams, $http, api) {

        $scope.id = $routeParams;

        api.get('id/' + $routeParams['id']).success(function(data) {
            $scope.data = data;    
            if ($scope.data.Target == undefined || $scope.data.Target[0].IP4 == undefined) {
                $http.get('http://freegeoip.net/json/' + $scope.data.Source[0].IP4[0]).success(function(data) {
                    $scope.geo = data;
                })
            } else {
                $http.get('http://freegeoip.net/json/' + $scope.data.Target[0].IP4[0]).success(function(data) {
                    $scope.geo = data;
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
