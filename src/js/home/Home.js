var CS;
(function(CS) {
	var Home;
	(function(Home) {
        var currentCB;
		Home.init = function(isInitial) {
            if (isInitial == null) isInitial = true;
			Home.height = window.innerHeight * 5;
			var downArrowEl = $(".arrow-down");
			var headerHeight = $("[header]").innerHeight;
			var $intro = $(".intro").height(window.innerHeight).css("top", headerHeight);
			$(".intro-container").height(Home.height);
			var arrowHeight = downArrowEl.outerHeight();
			var aboutMe = $(".about-me");
			aboutMe.height(window.innerHeight > aboutMe.height() ? window.innerHeight : aboutMe.height());
            var cb = function() {
                if (window.scrollY + window.innerHeight >= Home.height) $intro.removeClass("fixed");
                else $intro.addClass("fixed");
                if (window.scrollY >= (Home.height - arrowHeight)) downArrowEl.removeClass("active");
                else downArrowEl.addClass("active");
            };
            cb();
			$(document).off("scroll", currentCB);
			$(document).on("scroll", cb);
            currentCB = cb;
			Home.Canvas.init(isInitial);
			Home.SVG.init(isInitial);
		};
        $(window).on("resize", Home.init.bind(this, false));
	})(Home = CS.Home || (CS.Home = {}));
})(CS || (CS = {}));
