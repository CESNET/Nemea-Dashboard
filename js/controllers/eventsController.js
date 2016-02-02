app.controller('eventsController', function($scope, $http, $mdToast) {
    $scope.filter = {
        "category" : "",
        "proto" : "",
        "desc" : "",
        "flows_from" : "",
        "flows_to" : "",
        "items" : 100,
        "btn" : "Load"
    };
    $scope.query = {
        "from" : "",
        "to" : "",
        "date" : "",
        "limit" : 25
    }
    
    $scope.data = [];

    $http.get('http://benefizio.liberouter.org:5555/v2/events/' + $scope.filter.items).success(function(data) {
				//console.log(JSON.stringify(data));
				$scope.data = data;
	});

   $scope.parseDate = function(date) {
        var date_tmp = date;
        date_tmp.setHours(date_tmp.getHours() + 1);
        $scope.foodate = date_tmp.toJSON();

   }

    $scope.loadItems = function(query) {
        $scope.filter.btn = "Loading..."
    
        var date = JSON.stringify(query.date).split("T");
        var from_time = JSON.stringify(query.from).split("T");
        var to_time = JSON.stringify(query.to).split("T");

        var send = {
            "from" : JSON.parse(date[0] + "T" + from_time[1]),
            "to" : JSON.parse(date[0] + "T" + to_time[1]),
            "limit" : query.limit
        }
        console.log(String(date))
        $http.post('http://benefizio.liberouter.org:5555/v2/events/' + query.limit, send).success(function(data) {
		    console.log(data);
            
			$scope.data = data;
            $scope.filter.btn = "Done"
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Date loaded!')
                    .position("top right")
                    .hideDelay(3000)
                );
	    });
    }



    $scope.enableTable = true;
    /*$scope.filter = "$";
    $scope.search = {$ : '', "Source": [ { "Proto": [ "" ], "IP4": [ "" ] }]}
    $scope.changeFilterTo = function(pr) {
        $scope.filter = pr; 
    }*/

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

