var CS;
(function(CS) {
    var Home;
    (function(Home) {
        Home.init = function() {
            Home.height = window.innerHeight * 2;
            var downArrowEl = $(".arrow-down");
            var headerHeight = $("[header]").innerHeight;
            var $intro = $(".intro").height(window.innerHeight).css("top", headerHeight);
            var introContainerHeight = $(".intro-container").outerHeight();
            $intro.addClass("fixed");
            var arrowHeight = downArrowEl.outerHeight();
            var aboutMe = $(".about-me");
            aboutMe.height(window.innerHeight > aboutMe.height() ? window.innerHeight : aboutMe.height());
            $(document).on("scroll", function() {
               if (window.scrollY >= (introContainerHeight - window.innerHeight + arrowHeight)) {
                   $intro.removeClass("fixed");
               } else {
                   $intro.addClass("fixed");
               }
                if (window.scrollY >= (introContainerHeight- arrowHeight)) {
                    downArrowEl.removeClass("active");
                } else {
                    downArrowEl.addClass("active");
                }
            });
            Home.Canvas.init();
            Home.SVG.init();
        }
    })(Home = CS.Home || (CS.Home = {}));
})(CS || (CS = {}));
