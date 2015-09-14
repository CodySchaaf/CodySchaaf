var CS;
(function(CS) {
    var Home;
    (function(Home) {
        var SVG = (function() {
            function SVG() {
                this.draw();
            }

            SVG.prototype.draw = function() {
                var array = $("path").each(function(index, el) {
                    var $el = $(el);
                    $el.css({'stroke-dasharray': el.getTotalLength(), 'stroke-dashoffset': el.getTotalLength()});
                });
                $("svg").removeAttr("class");
                var animationEndEvents = ["animationend", "oAnimationEnd", "webkitAnimationEnd", "MSAnimationEnd", "mozAnimationEnd"];
                var drawSVG = function($el) {
                    array = array.not($el);
                    $el.attr("class", "add-svg-animation-path");
                    var cb = function() {
                        $el.off(animationEndEvents.join(' '), cb);
                        if (array.length !== 0) {
                            drawSVG(array.first());
                        } else {
                            $("path").removeAttr("class").css({'stroke-dashoffset': 0});
                            $(".svg-group").attr("class", "svg-group filled");
                        }
                    };
                    $el.on(animationEndEvents.join(' '), cb);
                };
                drawSVG(array.first());
            };
            SVG.init = function() {
                new SVG();
            };
            SVG.render = function() {
                if (Home.Canvas.doneDrawing && Home.Canvas.scrollIndex >= 0) {
                    $("path").each(function(index, el) {
                        var $el = $(el);
                        $el.css({'stroke-dashoffset': (el.getTotalLength() / Home.Canvas.maxScrollIndex) * (Home.Canvas.maxScrollIndex - Home.Canvas.scrollIndex)});
                        if (Home.Canvas.maxScrollIndex === Home.Canvas.scrollIndex) {
                            $(".svg-group").attr("class", "svg-group filled");
                        } else {
                            $(".svg-group").attr("class", "svg-group");
                        }
                    })
                }
            };
            return SVG;
        })();
        Home.SVG = SVG;
    })(Home = CS.Home || (CS.Home = {}));
})(CS || (CS = {}));
