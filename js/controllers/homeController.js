app.value('boxes_arr', [
  { 
    "row"   : 0,
    "height" : "",
    "items" : [
      {
        "title"   : "Events shares",
        "type"    : "piechart",
        "content" : "",
        "config"  : {
            "metric"    : "category",
            "type"      : "piechart",
            "period"    : "24",
            "begintime" : ""
        }
      },
      {
        "title"   : "Last 24 hours",
        "type"    : "barchart",
        "data"    : "",
        "timestamp": "",
        "config" : {
            "metric" : "category",
            "type" : "barchart",
            "period" : 24,
            "window" : 60,
            "begintime" : ""
        }
        /*"options" : { 
            chart: {
                type: 'multiBarChart',
                height: 300,
                margin : {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                x: function(d){ return d.x; },
                y: function(d){ return d.y; },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function(e){ console.log("stateChange"); },
                    changeState: function(e){ console.log("changeState"); },
                    //tooltipShow: function(e){ console.log("tooltipShow"); },
                    //tooltipHide: function(e){ console.log("tooltipHide"); }
                },
                xAxis: {
                    axisLabel: 'Time (ms)',
                    tickFormat: function(d) {
                        return d3.time.format('%x/%X')(new Date(d))
                    }
                },
                yAxis: {
                    axisLabel: 'Voltage (v)',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: 0
                },
            },
            title: {
                enable: true,
                text: 'Title for Line Chart 2'
            },
          }*/
      },
      // {
      //   "title": "three",
      //   "type"    : "incident"
      // },
    ]
  },
  { 
    "row"   : 1,
    "items" : [
      {
        "title" : "Top events in 1 hour",
        "type"  : "top",
        "config" : {
            "period" : 1,
            "begintime" : ""
        },
      },
      {
        "title": "2",
        "type"    : "incident"
      },
    ]
  },
  ]);

//app.value('editMode', false);

function processData(data) {
  var dataArr = [];
  angular.forEach(data, function(value, key) {
    //console.log(data[key]["scale"]);
    dataArr.push({ x : data[key]["time_first"]*1000, y : data[key]["scale"]});
  });

  return [{values: dataArr}];
};

function pieChart(data) {
  var counter = new Object();
  angular.forEach(data, function(value, key) {
      var doctype = data[key]['type'];

      if (counter[doctype] != undefined ) {
        counter[doctype] += 1;
      } else {
        counter[doctype] = 1;
      }
  });

  var dataArr = [];
  angular.forEach(counter, function(value, key) {
    dataArr.push({key : key, y : value});
  });

  return dataArr;
}

app.controller('userController', function($scope){
  console.log("hello!");
});

app.controller('homeController', function($scope, $log, api, boxes_arr, $http, $localStorage, user) {
	$scope.$storage = $localStorage.$default({
        counter : 42,
        //config : user.config()
    });


    $scope.boxes_arr = boxes_arr;
    $scope.title = "Home sweet home";
  

    $scope.addRow = function() {
        $log.info("adding row");
        console.log(boxes_arr);
        var tmp = {};

        tmp.row = boxes_arr.length;
        tmp.items = [{
            "title" : "aloha!"
        }];
        boxes_arr.push(tmp);
    };

});


app.constant("MENU", [
	{
		"title" : "Dashboard",
        "link" : "/"
		/*"items" : [
			{
				"title" : "Users",
				"link"	: "user"
			},
			{
				"title" : "My profile"
			}
		]*/
	},
	{
		"title" : "Events",
		"link" 	: "/events"
	},
	/*{
		"title" : "Analytics23",
		"items" : [
			{
				"title" : "Users",
				"link" 	: "settings"
			},
			{
				"title" : "My profile",
				"link"	: "profile"
			},
			{
				"title" : "My profile",
				"link"	: "profile"
			}
		]

	},
	{
		"title" : "Analytics123",
		"link" 	: "login"
	},*/
	{
		"title" : "Settings",
		"items" : [
			{
				"title" : "Users",
				"link" 	: "/settings"
			},
			{
				"title" : "My profile",
				"link"	: "/profile"
			},
			{
				"title" : "My profile",
				"link"	: "/profile"
			}
		]
	}
]);



app.factory('confirmLogout', function(){
	return function (){
	    
	};
});

app.controller('topBar', topBarCtrl);

function topBarCtrl($mdDialog, confirmLogout, $location, $mdSidenav){

	this.user = "Petr"

  this.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };
  	
  this.logout = function() {
    var confirm = $mdDialog.confirm()
	        .title('Are you sure?')
	        .content('You are about to be logged out. All unsaved changes will be lost in the void!')
	        .ok('Log me out')
	        .cancel('Keep me here')
    $mdDialog.show(confirm).then(
    	function() {
    		$location.path('/login');
    	});
  };

  
};

app.controller('row', function($scope, $timeout){
  $scope.$on('requestRedraw', function(e) {
    e.stopPropagation();
    $timeout(function() {
      console.log("request accepted");
      window.dispatchEvent(new Event('resize'));
    }, 10);
  });
});

app.controller('box', function($scope, $log, boxes_arr, $timeout, $element, $mdDialog, PROTOCOLS, TYPES, CATEGORIES, $http, PIECHART, AREA, api){
    
    function timeShift() {    
        if ($scope.box != undefined && ($scope.box.type == "piechart" || $scope.box.type == "barchart" || $scope.box.type == 'top' )) {
            $scope.box.config.begintime = (function() {
                var now = new Date();
                now.setHours(now.getHours() - $scope.box.config.period);
                console.log(now)
                return now;
            })();
        }
    }

    timeShift();

    $scope.loading = true;
        
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.editMode = false;
    $scope.backupModel = {};

    $scope.protocol = PROTOCOLS;
    $scope.types = TYPES;
    $scope.categories = CATEGORIES;


    ///////////////////////////////////////////////////////
    // Edit mode handling
    ///////////////////////////////////////////////////////

    // Trigger editing mode and save current state
    $scope.edit = function(box) {
        $scope.editMode = true;
        $scope.backupModel = angular.copy(box);
    }

    // Save changes and disable edit mode
    $scope.save = function() {
        $scope.user();
        if ($scope.box.type == 'piechart')
            $scope.box.options = PIECHART.options;
        if ($scope.box.type == 'barchart')
            $scope.box.options = AREA.options;$scope.backupModel = {};

        $scope.box.config.type = $scope.box.type;
        
        // Disable edit mode
        $scope.editMode = false;

        // Show loading indicator
        $scope.loading = true;

        // Shift time for query
        timeShift();

        // Get required data
        if ($scope.box.type == 'piechart' || $scope.box.type == 'barchart') {
            api.post('agg', $scope.box.config, true).success(function(data) {
                $scope.loading = false;    
                $scope.box.data = data;
            })
        } else if ($scope.box.type == 'top') {
            api.post('top', $scope.box.config, true).success(function(data) {
                $scope.loading = false;    
                $scope.box.data = data; 
            })
        }
    }

    // Revert to original and disable edit mode
    $scope.cancel = function(box) {
        $scope.box = angular.copy($scope.backupModel);
        $scope.backupModel = {};
        $scope.editMode = false;
    }
    $scope.total = 0;

    $scope.top = function() {
        timeShift()
        api.post('top', $scope.box.config, true).success(function(data) {
                console.log(data);
                })
    }
    
    if ($scope.box != undefined) {
        if ($scope.box.type == "piechart" || $scope.box.type == "barchart") {
            if ($scope.box.type == 'piechart')
                $scope.box.options = PIECHART.options;
            if ($scope.box.type == 'barchart')
                $scope.box.options = AREA.options;
           
            $scope.box.config.type = $scope.box.type;
            
            api.post('agg', $scope.box.config).success(function(data) {
                $scope.loading = false;
                $scope.box.data = data;
                
                // Sum all events
                if ($scope.box.type == 'piechart') {
                    for(var i = 0; i < $scope.box.data.length; i++) {
                        console.log($scope.box.data[i].x)
                        $scope.total = $scope.total + Number($scope.box.data[i].x);
                    }
                }
            });
        } else if ($scope.box.type == 'top') {
            api.post('top', $scope.box.config).success(function(data) {
                $scope.loading = false;
                $scope.box.data = data;        
            })
        }
    }

    $scope.user = function() {
        var settings = angular.copy($scope.boxes_arr);
        console.log(settings);
        for (var i = 0; i < settings.length; i++) {
            for (var j = 0; j < settings[i].items.length; j++) {
                settings[i].items[j].data = [];
                console.log(settings[i].items[j].data);
            }
        }
        
        var query = {
            'id' : '56b33e737194ed8d440db2b7',
            'password' : 'password',
            'settings' : settings
        }
        $http.put('http://benefizio.liberouter.org:5555/v2/users/', JSON.stringify(query))
            .success(function(data) {
                console.log(data);
            })
            .error(function(data){
                $log.error(data)
            })
    }

    


  //Add element to given row
    $scope.addElem = function(index) {
        $log.info("adding element");

        var item = {
            title : 'New widget',
            config : {}

        };
        $scope.full = false;


    if (boxes_arr[index].items.length > 5) {
      $scope.full = true;
    } else {
      boxes_arr[index].items.push(item);
    }

    $scope.$emit('requestRedraw');
  };

  $scope.removeElem = function(parIndex,index) {

    $log.info(parIndex);
    $log.info(index);

    boxes_arr[parIndex].items.splice(index, 1);
    var tmp = {};
            
    if(boxes_arr[parIndex].items.length == 0) {
      tmp = boxes_arr[parIndex].items[index];
      boxes_arr.splice(parIndex, 1);
    }

    $scope.$emit('requestRedraw');
  };

});
