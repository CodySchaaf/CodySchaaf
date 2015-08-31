var CS;
(function(CS) {
    var Home;
    (function(Home) {
        Home.init = function() {
            Home.Canvas.init();
            Home.SVG.init();
        }
    })(Home = CS.Home || (CS.Home = {}));
})(CS || (CS = {}));
