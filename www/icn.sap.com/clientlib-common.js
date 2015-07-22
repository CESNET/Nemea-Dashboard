var BFL = (function () {

    function init() {
        if (typeof window.console === "undefined" || typeof window.console.log === "undefined") {
            window.console = {};
            window.console.log = function () {
            };
        }
    }

    function defineNamespace(name, separator, container) {
        var ns = name.split(separator || '.'),
            o = container || window,
            i,
            len;
        for (i = 0, len = ns.length; i < len; i++) {
            o = o[ns[i]] = o[ns[i]] || {};
        }
        return o;
    }

    // constructor
    {
        init();
    }

    return {
        MainNamespace: defineNamespace("BFL.ui"),

        ClassicUINamespace: defineNamespace("BFL.ui.classic")
    }

})();
BFL.MainNamespace.Utils = (function ($) {

    return {

        isEditMode: function () {
            if (typeof CQ !== "undefined" && CQ.WCM) {
                if (CQ.WCM.isEditMode(true)) {
                    return true;
                }
            }
            return false;
        },

        isPreviewMode: function () {
            if (typeof CQ !== "undefined" && CQ.WCM) {
                if (CQ.WCM.isPreviewMode(true)) {
                    return true;
                }
            }
            return false;
        },

        isDesignMode: function () {
            if (typeof CQ !== "undefined" && CQ.WCM) {
                if (CQ.WCM.isDesignMode(true)) {
                    return true;
                }
            }
            return false;
        },

        isAuthorInstance: function () {
            return (typeof CQ !== "undefined" && CQ.WCM);
        }

    };

})(jQuery);
