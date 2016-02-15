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
      }
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


app.controller('homeController', function($scope, $log, api, boxes_arr, $http, $localStorage, user) {

    $scope.boxes_arr = user.config();

    console.log(user.config())
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

app.controller('topBar', topBarCtrl);

function topBarCtrl($mdDialog, $location, $mdSidenav){

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

app.controller('box', function($scope, $log, boxes_arr, $timeout, $element, $mdDialog, PROTOCOLS, TYPES, CATEGORIES, $http, PIECHART, AREA, api, $location, user){
    
    function timeShift() {    
        if ($scope.box != undefined && ($scope.box.type == "piechart" || $scope.box.type == "barchart" || $scope.box.type == 'top' )) {
            $scope.box.config.begintime = (function() {
                var now = new Date();
                now.setHours(now.getHours() - $scope.box.config.period);
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
        $scope.$emit("switch-drag");
    }

    // Save changes and disable edit mode
    $scope.save = function() {
        $scope.user();
        if ($scope.box.type == 'piechart') {
            $scope.box.options = PIECHART.options;
            
        }
        if ($scope.box.type == 'barchart')
            $scope.box.options = AREA.options;
        

        $scope.backupModel = {};

        $scope.box.config.type = $scope.box.type;
        
        // Disable edit mode
        $scope.editMode = false;

        // Show loading indicator
        $scope.loading = true;

        // Shift time for query
        timeShift();

        $scope.$emit("switch-drag");
        // Get required data
        if ($scope.box.type == 'piechart' || $scope.box.type == 'barchart') {
            api.get('agg', $scope.box.config, true).success(function(data) {
                $scope.loading = false;    
                $scope.box.data = data;
            })
        } else if ($scope.box.type == 'top') {
            api.get('top', $scope.box.config, true).success(function(data) {
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
        $scope.$emit("switch-drag");
    }
    
    $scope.top = function() {
        timeShift()
        api.get('top', $scope.box.config, true).success(function(data) {
            console.log(data);
            $scope.box.data = data;
        })
    }
    
    if ($scope.box != undefined) {
        if ($scope.box.type == "piechart" || $scope.box.type == "barchart") {
            if ($scope.box.type == 'piechart') {
                $scope.box.options = PIECHART.options;
            }
            if ($scope.box.type == 'barchart')
                $scope.box.options = AREA.options;
           
            $scope.box.config.type = $scope.box.type;
            
            api.get('agg', $scope.box.config).success(function(data) {
                $scope.loading = false;
                $scope.box.data = data;
                
                // Sum all events
                if ($scope.box.type == 'piechart') {
                    for(var i = 0; i < $scope.box.data.length; i++) {
                        $scope.total = $scope.total + Number($scope.box.data[i].x);
                    }
                }
            });
        } else if ($scope.box.type == 'top') {
            api.get('top', $scope.box.config).success(function(data) {
                $scope.loading = false;
                $scope.box.data = data;        
            })
        }
    }

    $scope.user = function() {
        var settings = angular.copy($scope.boxes_arr);
        console.log($scope.boxes_arr)
        for (var i = 0; i < settings.length; i++) {
            for (var j = 0; j < settings[i].items.length; j++) {
                settings[i].items[j].data = [];
            }
        }
        
        var query = {
            "jwt" : user.jwt(),
            "settings" : settings
        }
        user.put(query)
            .success(function(data) {
                console.log(data);
            })
            .error(function(data){
                $log.error(data)
            })
    }

    $scope.$on('gridster-item-resized', function(gridster) {
        $timeout(function() {
          console.log("request accepted");
          window.dispatchEvent(new Event('resize'));
        }, 100);
    })

  
});

app.controller('grid', function($scope, $timeout, $log) {
$scope.opt = {
    outerMargin: false,
    columns: 6,
    pushing: true,
    rowHeight: 'match',
    colWidth : 'auto',
    floating: true,
    swapping: true,
    draggable: {
        enabled: false,
    },
    resizable: {
        enabled: false,
        handles: ['n', 'e', 's', 'w', 'se', 'sw'],
        stop: function(event, $element, widget) {
            console.log("resize end");
            $scope.$emit('requestRedraw');
            $timeout(function() {
              console.log("request accepted");
              window.dispatchEvent(new Event('resize'));
            }, 100);

        }
    }
}

$scope.$on('switch-drag', function() {
    $scope.opt.resizable.enabled = !$scope.opt.resizable.enabled; 
    $scope.opt.draggable.enabled = !$scope.opt.draggable.enabled; 
})

$scope.remove = function(box) {

    $log.info(box);

    var tmp = $scope.items.splice($scope.items.indexOf(box), 1);
    $log.info(tmp)

    /*boxes_arr[parIndex].items.splice(index, 1);
    var tmp = {};
            
    if(boxes_arr[parIndex].items.length == 0) {
      tmp = boxes_arr[parIndex].items[index];
      boxes_arr.splice(parIndex, 1);
    }

    $scope.$emit('requestRedraw');*/
  };


$scope.items = [{
    sizeX: 2,
    sizeY: 2,
    row: 0,
    col: 0,
    "title"   : "Events shares",
    "type"    : "piechart",
    "content" : "",
    "config"  : {
        "metric"    : "category",
        "type"      : "piechart",
        "period"    : "24",
        "begintime" : ""
    }
}, {
    sizeX: 2,
    sizeY: 2,
    minSizeX : 2,
    minSizeY : 2,
    row: 0,
    col: 2,
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
}, {
    "title" : "Top events in 1 hour",
    "type"  : "top",
    "config" : {
        "period" : 1,
        "begintime" : ""
    }
}];
//    var row = $scope.standardItems[$scope.standardItems.length - 1].row + 1;
//    var col = $scope.standardItems[$scope.standardItems.length - 1].col + 1;
$scope.additem = {
    sizeX: 1,
    sizeY: 1,
    //row : row,
    //col : col
} 

})
