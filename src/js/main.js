var CS;
(function(CS) {
    CS.initArray = [];
    CS.init = function() {
        //CS.initArray.forEach(function(item, index) {
        //    item();
        //})
        CS.Home.init();
    }
})(CS || (CS = {}));
window.onload = CS.init;
