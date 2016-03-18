app.service('dashboard', function($log, $localStorage, user) {

    var selectedDashboard = 0;
    var dashboards = $localStorage['dashboard'];
    var active = $localStorage['dashboard'][selectedDashboard];
    var backup;

    this.getAll = function() {
        return $localStorage['dashboard'];
    }

    this.get = function() {
        return  $localStorage['dashboard'][selectedDashboard];
    }

    this.settings = function() {
        return  $localStorage['dashboard'][selectedDashboard].settings;
    }

    this.active = function(index) {
        if (angular.isDefined(index)) {
            selectedDashboard = index
        }

        //active = $localStorage['dashboard'][selectedDashboard];

        return selectedDashboard;
    }

    this.update = function(updatedDashboard) {
        if (angular.isUndefined(updatedDashboard))
            active.settings = 0;
        else
            active.settings = updatedDashboard;

        //dashboards = $localStorage['dashboard'];
    }

    this.clean = function() {
         var settings = angular.copy($localStorage['dashboard']);
        //console.log(settings)
        
        // Remove data and graph options
        for (var i = 0; i < settings.length; i++) {
            //console.log(settings[i]);
            //console.log(settings[i].items.length)
            for (var j = 0; j < settings[i].items.length; j++) {
                delete settings[i].items[j]["data"];
                delete settings[i].items[j]["options"];
            }
        }

        return settings;
    }

    this.save = function() {
       
        var query = {
            "settings" : this.clean()
        }

        //console.log(query)

        //$log.info(query)
        return user.put(query)
            .success(function(data) {
                //console.log(data);
            })
            .error(function(data){
                $log.error(data)
            })
    }

    this.add = function(newDashboard) {
        // We need to set up first item in dashboard 
        var tmpDashboard = {
            settings : newDashboard,
            items : [{
                "title" : "New box",
                "loading" : false,
                sizeX: 1,
                sizeY: 1,
                content: "Click the menu icon to select edit",
                config : {
                    period : "0"
                }

            }]
        }

        $localStorage['dashboard'].push(tmpDashboard);
        //console.log( $localStorage['dashboard'].length - 1);

        return ( $localStorage['dashboard'].length - 1);

    }

    this.delete = function() {
        backup =  $localStorage['dashboard'].splice( $localStorage['dashboard'].indexOf(active), 1);
        selectedDashboard = 0;

        return backup;
    
    }

    this.switch = function(index) {
        active = $localStorage['dashboard'][index];
        selectedDashboard = index;
        return active;
    }

    this.reset = function() {
        selectedDashboard = 0;
        active = $localStorage['dashboard'][selectedDashboard]
    }
        
});
