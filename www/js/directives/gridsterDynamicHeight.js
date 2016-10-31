app.directive('gridsterDynamicHeight', function ($timeout) {

    var directive = {
        scope: {
            item: "=" //gridster item
        },
        link: link,
        restrict: 'A'
    };
    return directive;

    function link(scope, element, attrs) {
        scope.$watch(function() {
            return element[0].scrollHeight;
        },
        function(newVal, oldVal) { 
            var rowHeightOption = 270; // Change this value with your own rowHeight option
            var height = rowHeightOption * scope.item.sizeY;
            //console.log(scope.item.title);
            //console.log("newVal: " + newVal + "     height: " + height)
            if(newVal > height){
                var div = Math.floor(newVal / rowHeightOption);
                //div++;
                scope.item.sizeY = div; 
            }
        });

    }
});
