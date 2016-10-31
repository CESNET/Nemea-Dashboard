// Filter to convert IDEA format from MongoDB to standardized IDEA format
app.filter('idea', function() {
    return function(input) {
        var res = {};

        angular.forEach(input, function(value, key) {
            if (key != '_id') {
                if (value['$date']) {
                    console.log(value['$date']);
                    res[key] = new Date(value['$date']).toISOString().slice(0,19) + 'Z';
                } else {
                    res[key] = value;
                }
            }
        });

        return res;
    }
});
