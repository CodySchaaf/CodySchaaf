var CS;
(function(CS) {
    var Home;
    (function(Home) {
        var SVG = (function() {
            var draw = function() {
                var array = $("path").each(function(index, el) {
                    var $el =  $(el);
                    $el.css({'stroke-dasharray': el.getTotalLength(),'stroke-dashoffset': el.getTotalLength()});
                });
                $("svg").removeAttr("class");
                var animationEndEvents = ["animationend", "oAnimationEnd", "webkitAnimationEnd", "MSAnimationEnd", "mozAnimationEnd"];
                var drawSVG = function($el) {
                    array = array.not($el);
                    $el.attr("class", "add-svg-animation-path");
                    $el.attr("class", "add-svg-animation-path");
                    var cb = function() {
                        $el.off(animationEndEvents.join(' '), cb);
                        if (array.length !== 0) {
                            drawSVG(array.first());
                        } else {
                            $("path").removeAttr("class").css({'stroke-dashoffset': 0});
                        }
                    };
                    $el.on(animationEndEvents.join(' '), cb);
                };
                drawSVG(array.first());
            };
            var init = function() {
                draw();
                var cb = function(event) {
                    if (Home.Canvas.doneDrawing && Home.Canvas.scrollIndex >= 0) {
                        $("path").each(function(index, el) {
                            var $el = $(el);
                            $el.css({'stroke-dashoffset': (el.getTotalLength()/Home.Canvas.maxScrollIndex) * (Home.Canvas.maxScrollIndex - Home.Canvas.scrollIndex)});
                        })
                    }
                };
                $(window).on('mousewheel', cb);
                $('#eventDelegator').on('SVG:clear', cb);
            };
            return {
                init: init
            }
        })();
        Home.SVG = SVG;
    })(Home = CS.Home || (CS.Home = {}));
})(CS || (CS = {}));
