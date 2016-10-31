app.filter('json2html', function($sce, $filter) {
    return function(input) {
        var html = "";

        angular.forEach(input, function(value, key) {
            if (key != "_id") {
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
            }
        })
        return $sce.trustAs('html', html);
    }     
});

