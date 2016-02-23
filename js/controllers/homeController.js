app.controller('homeController', function($scope, user, $timeout, $log, $localStorage, $route) {
    $scope.activeGrid = false; 
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.addItem = function() {
        $scope.$broadcast('addItem');
    }

    $scope.enableGrid = function() {
        console.log('Enable grid')
        $scope.$broadcast('enableGrid');
        $scope.activeGrid = !$scope.activeGrid;
    }
    $scope.$on('requestRedraw', function(e) {
        e.stopPropagation();
        $timeout(function() {
            console.log("request accepted");
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });

    $scope.clearCache = function() {
        $log.debug("deleting timestamp")
        delete $localStorage['timestamp'];
        $route.reload();
    }

});

app.controller('box', function($scope, $log, $mdDialog, PROTOCOLS, TYPES, CATEGORIES, PIECHART, AREA, api, user, $mdMedia, $localStorage, $timeout){
    function timeShift() {    
        if ($scope.box != undefined && ($scope.box.type == "piechart" || $scope.box.type == "barchart" || $scope.box.type == 'top' || $scope.box.type == "sum" )) {
            $scope.box.config.begintime = (function() {
                var now = new Date();
                now.setHours(now.getHours() - $scope.box.config.period);
                return now;
            })();
        }
    }

    timeShift();

    $scope.box.loading = true;
        
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

        
        // Shift time for query
        timeShift();

        $scope.$emit("switch-drag");
        // Get required data
        if ($scope.box.type == 'piechart' || $scope.box.type == 'barchart') {
            api.get('agg', $scope.box.config, true).success(function(data) {
                $scope.box.loading = false;    
                $scope.box.data = data;
            })
        } else if ($scope.box.type == 'top') {
            api.get('top', $scope.box.config, true).success(function(data) {
                $scope.box.loading = false;    
                $scope.box.data = data;
            })
        } else if ($scope.box.type == 'sum') {
            api.get('count', $scope.box.config).success(function(data) {
                $scope.box.loading = false;
                $scope.box.data = data;
            })
        }
    }
    $scope.changeSelector = function(sel) {
        angular.forEach($scope.box.data, function(value, key) {
            angular.forEach(value.values, function(val, k) {
                val['selector'] = sel;
            })
        })
        $scope.$emit('requestRedraw')

    }

    $scope.changeSelector($scope.box.selector);

    

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

    var cache_time = (new Date() - new Date($localStorage['timestamp']))/1000;
    if (isNaN(cache_time))
        cache_time = 300 + 10;

    $scope.$on('gridster-item-initialized', function(item) {
        $timeout(function() { $scope.$emit('requestRedraw');}, 100);
    })

    
    // Show loading indicator
    if (cache_time < 300)
        $scope.box.loading = false;
    else
        $scope.box.loading = true;

    if ($scope.box.type == "piechart" || $scope.box.type == "barchart") {
        if ($scope.box.type == 'piechart') {
            $scope.box.options = PIECHART.options;
        }
        if ($scope.box.type == 'barchart')
            $scope.box.options = angular.copy(AREA.options);
       
        $scope.box.config.type = $scope.box.type;
        if (cache_time > 300) {
            api.get('agg', $scope.box.config, false, true).success(function(data) {
                $scope.box.loading = false;
                $scope.box.data = data;
                $scope.$emit('requestRedraw');
            });
        }
    } else if ($scope.box.type == 'top' && cache_time > 300) {
        api.get('top', $scope.box.config, false, true).success(function(data) {
            $scope.box.loading = false;
            $scope.box.data = data;
        })
    } else if ($scope.box.type == 'sum' && cache_time > 300) {
        api.get('count', $scope.box.config, false, true).success(function(data) {
            $scope.box.loading = false;
            $scope.box.data = data;
            console.log($scope.box);
        })
    }
 
    $scope.user = function() {
        var settings = angular.copy($scope.items);
        for (var i = 0; i < settings.length; i++) {
                delete settings[i]["data"];
                delete settings[i]["options"];
        }
        
        var query = {
            "settings" : settings
        }

        $log.info(query)
        user.put(query)
            .success(function(data) {
                console.log(data);
            })
            .error(function(data){
                $log.error(data)
            })
    }

    $scope.$on('saveUser', function() {
        $scope.user()
    });

    $scope.$on('gridster-item-resized', function(gridster) {
        $timeout(function() {
          console.log("request accepted");
          window.dispatchEvent(new Event('resize'));
        }, 100);
    })


    $scope.showEdit = function(ev, box) {
        $scope.backupModel = angular.copy($scope.box);

        $mdDialog.show({
            controller: 'editBoxController',
            templateUrl: 'partials/edit.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: true,
            locals: {
                box: $scope.box
            },
        })
        .then(function(answer) {
            $scope.save();
        }, function() { // cancel
            $scope.box = angular.copy($scope.backupModel);
            $scope.backupModel = {};
        });
        
  };

  
});

app.controller('grid', function($scope, $timeout, $log/*, $mdMedia, $window*/, user) {
$scope.opt = {
    outerMargin: false,
    columns: 8,
    pushing: true,
    rowHeight: 170,
    colWidth : 'auto',
    floating: true,
    swapping: true,
    mobileBreakPoint: 933,
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

$scope.$on('enableGrid', function() {
    if ($scope.opt.resizable.enabled == true) {
        $scope.$broadcast('saveUser');
    }
    
    $scope.opt.resizable.enabled = !$scope.opt.resizable.enabled; 
    $scope.opt.draggable.enabled = !$scope.opt.draggable.enabled; 
})

$scope.remove = function(box) {

    var tmp = $scope.items.splice($scope.items.indexOf(box), 1);

  };

$scope.items = user.config();
    $scope.$on('addItem', function() {
        var item = {
            "title" : "New box",
            "loading" : false,
            sizeX: 1,
            sizeY: 1,
            //row : row,
            //col : col
        }

        $scope.items.push(item)
    });


})


app.controller('editBoxController', function($scope, $mdDialog, box, PROTOCOLS, TYPES, CATEGORIES) {
    
    $scope.box = box;
    
    $scope.backupModel = angular.copy(box);

    $scope.categories = CATEGORIES;
    $scope.protocols = PROTOCOLS;
    $scope.types = TYPES;

    $scope.saveAndClose = function() {
        $mdDialog.hide();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };


    $scope.cancel = function(box) {
        console.log("Cancelling");
        $mdDialog.cancel();
    }

    $scope.changeSelector = function(sel) {
        angular.forEach($scope.box.data, function(value, key) {
            angular.forEach(value.values, function(val, k) {
                val['selector'] = sel;
            })
        })
        $scope.$emit('requestRedraw')

    }


});

