app.controller('eventsController', function($scope, $http) {
    $scope.hello = 'Hello';  
    $scope.filter = {
        "category" : "",
        "proto" : "",
        "desc" : "",
        "flows_from" : "",
        "flows_to" : "",
        "items" : 100,
        "btn" : "Load"
    };
    
    $scope.data = [];

    $http.get('http://pcstehlik.fit.vutbr.cz:5555/v2/events/' + $scope.filter.items).success(function(data) {
				//console.log(JSON.stringify(data));
				$scope.data = data;
	});

    

    $scope.loadItems = function(num) {
        $scope.filter.btn = "Loading..."
    
        console.log(num);
        $http.get('http://pcstehlik.fit.vutbr.cz:5555/v2/events/' + num).success(function(data) {
		    //console.log(JSON.stringify(data));
			$scope.data = data;
            $scope.filter.btn = "Done"
	    });
    }



  $scope.enableTable = true;
    /*$scope.filter = "$";
    $scope.search = {$ : '', "Source": [ { "Proto": [ "" ], "IP4": [ "" ] }]}
    $scope.changeFilterTo = function(pr) {
        $scope.filter = pr; 
    }*/

    var i = 0;

    $scope.events = function(item) {
        //console.log(JSON.stringify(item));
        var res = [];
        if ($scope.filter.proto != ""){
            if (i == 50) {console.log("filtering proto"); i = 0;}
            if ("Source" in item) {
                if ("Proto" in item.Source[0] && item.Source[0].Proto[0].toLowerCase().indexOf($scope.filter.proto.toLowerCase()) > -1) {
                    res.push(1);
                }
                else
                    res.push(0);
            } else {
                res.push(0);
            }
        }

        if ($scope.filter.category != "") {
            if (item.Category[0].toLowerCase().indexOf($scope.filter.category.toLowerCase()) > -1) {
                res.push(1);
            } else {
                res.push(0);
            }
        }

        if ($scope.filter.desc != "") {
            if (item.Description.toLowerCase().indexOf($scope.filter.desc.toLowerCase()) > -1)
                res.push(1);
            else
                res.push(0);
        }

        if ($scope.filter.flows_from != "") {
            if (item.FlowCount > Number($scope.filter.flows_from))
                res.push(1);
            else
                res.push(0);
        }

        if ($scope.filter.flows_to != "") {
            if (item.FlowCount < Number($scope.filter.flows_to))
                res.push(1);
            else
                res.push(0);
        }

        var logicvalue = 1;
  //      console.log(res);
        for (var i = 0; i < res.length; i++) {
            logicvalue = logicvalue * res[i];
      //      console.log(Number(res[i]));
    //        console.log(logicvalue);
        }
        return logicvalue == 1 ? true : false;


    }

});

