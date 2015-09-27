var CS;
(function(CS) {
    CS.initArray = [];
    CS.init = function() {
        CS.Delegator = $('#eventDelegator');
        CS.initArray.forEach(function(item, index) {
            item();
        });
        $(".link").on("touchend", function(event) {
            setTimeout(function() {
                window.location.href = $(this).attr("href");
            },400);
        });
        CS.Home.init();
    }
})(CS || (CS = {}));
window.onload = CS.init;
