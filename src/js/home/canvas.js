var CS;
(function(CS) {
    var Home;
    (function(Home) {
        var Canvas = (function() {
            var canvasElement;
            var canvasWidth;
            var canvasHeight;
            var baseYOffset;
            var cXOffset;
            var oXOffset;
            var dXOffset;
            var yXOffset;
            var letterSize;
            var letterYSize;
            var letterXSize;

            var cachedCanvases = {};

            var normal = function(big, small) {
                if (small === undefined) {small = 0}
                return big + (small * (canvasWidth/3000));
            };
            var pointsStartFn = function() {
                return {
                    'c1': [cXOffset-normal(letterXSize),baseYOffset-normal(letterYSize, 50)],
                    'c2': [cXOffset-normal(letterXSize, 50),baseYOffset-normal(letterYSize)],
                    'c3': [cXOffset-normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'o1': [oXOffset-normal(letterXSize),baseYOffset-normal(0, 50)],
                    'o2': [oXOffset+normal(letterXSize),baseYOffset-normal(0, 50)],
                    'o3': [oXOffset-normal(letterXSize, 50),baseYOffset+normal(0)],
                    'o4': [oXOffset-normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'd1': [dXOffset-normal(letterXSize),baseYOffset-normal(0, 50)],
                    'd2': [dXOffset+normal(letterXSize),baseYOffset-normal(letterYSize, 50)],
                    'd3': [dXOffset-normal(letterXSize, 50),baseYOffset+normal(0)],
                    'd4': [dXOffset-normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'y1': [yXOffset-normal(letterXSize),baseYOffset-normal(0, 50)],
                    'y2': [yXOffset+normal(letterXSize),baseYOffset-normal(0, 50)],
                    'y3': [yXOffset-normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'y4': [yXOffset+normal(letterXSize, 50),baseYOffset+normal(letterYSize*2)]
                }
            };
            var pointsEndFn = function() {
                return {
                    'c1': [cXOffset-normal(letterXSize),baseYOffset+normal(letterYSize, 50)],
                    'c2': [cXOffset+normal(letterXSize, 50),baseYOffset-normal(letterYSize)],
                    'c3': [cXOffset+normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'o1': [oXOffset-normal(letterXSize),baseYOffset+normal(letterYSize, 50)],
                    'o2': [oXOffset+normal(letterXSize),baseYOffset+normal(letterYSize, 50)],
                    'o3': [oXOffset+normal(letterXSize, 50),baseYOffset+normal(0)],
                    'o4': [oXOffset+normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'd1': [dXOffset-normal(letterXSize),baseYOffset+normal(letterYSize, 50)],
                    'd2': [dXOffset+normal(letterXSize),baseYOffset+normal(letterYSize, 50)],
                    'd3': [dXOffset+normal(letterXSize, 50),baseYOffset+normal(0)],
                    'd4': [dXOffset+normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'y1': [yXOffset-normal(letterXSize),baseYOffset+normal(letterYSize, 50)],
                    'y2': [yXOffset+normal(letterXSize),baseYOffset+normal(letterYSize*2, 50)],
                    'y3': [yXOffset+normal(letterXSize, 50),baseYOffset+normal(letterYSize)],

                    'y4': [yXOffset-normal(letterXSize*20, 50),baseYOffset+normal(letterYSize*2)]
                }
            };

            var init = function() {
                var downArrowEl = $(".arrow-down");
                $(window.document).find("body").css('overflow', 'hidden');
                window.scrollTo(0,0);
                setTimeout(function() {
                    window.scrollTo(0,0);
                });
                var parent = $('.canvas-container');
                canvasElement = document.getElementById('myCanvas');
                var context = canvasElement.getContext('2d');
                context.canvas.width  = parent.width();
                context.canvas.height = 300;
                canvasWidth = canvasElement.width;
                canvasHeight = canvasElement.height;
                baseYOffset = canvasHeight/2;
                var baseXOffset = canvasWidth/5;
                cXOffset = baseXOffset;
                oXOffset = baseXOffset*2;
                dXOffset = baseXOffset*3;
                yXOffset = baseXOffset*4;

                letterSize = (baseXOffset < baseYOffset ? baseXOffset : baseYOffset)/3;
                letterYSize = letterSize;
                letterXSize = letterSize/2;

                var max = 2000;
                var cachedKeys = ["0"];
                var currentStart = function(letter) {
                    return pointsStartFn()[letter];
                };
                var currentEnd = function(letter) {
                    return pointsEndFn()[letter];
                };
                var moveTo = function(points, cachedContext) {
                    context.moveTo(points[0], points[1]);
                    cachedContext.moveTo(points[0], points[1]);
                };
                var lineTo = function(letter, step, cachedContext) {
                    var start = currentStart(letter);
                    var end = currentEnd(letter);
                    var diffX = end[0] - start[0];
                    var stepSizeX = diffX/max;
                    var diffY = end[1] - start[1];
                    var stepSizeY = diffY/max;
                    context.lineTo(start[0] + stepSizeX * step, start[1] + stepSizeY * step);
                    cachedContext.lineTo(start[0] + stepSizeX * step, start[1] + stepSizeY * step);
                };
                var cachedCanvas = document.createElement('canvas');
                cachedCanvas.width = context.canvas.width;
                cachedCanvas.height = context.canvas.height;
                cachedCanvases[0] = cachedCanvas;

                var draw = function() {
                    var stepEr = 0;
                    var strokePoints = function(step) {
                        var oldCachedCanvas = cachedCanvases[cachedKeys[Canvas.scrollIndex]];
                        var cachedCanvas = document.createElement('canvas');
                        var cachedContext = cachedCanvas.getContext('2d');

                        //set dimensions
                        cachedCanvas.width = oldCachedCanvas.width;
                        cachedCanvas.height = oldCachedCanvas.height;

                        //apply the old canvas to the new one
                        cachedContext.drawImage(oldCachedCanvas, 0, 0);

                        if (step < max) {
                            _.forOwn(pointsStartFn(), function(points, letter) {
                                moveTo(points, cachedContext);
                                lineTo(letter, step, cachedContext);
                                context.lineWidth = 2;
                                cachedContext.lineWidth = 2;
                            });
                            if (step / max >= 1 / 8) {
                                context.strokeStyle = 'rgba(0, 49, 83, ' + (1 / 8) / (step / max) + ')';
                                cachedContext.strokeStyle = 'rgba(0, 49, 83, ' + (1 / 8) / (step / max) + ')';
                            } else {
                                context.strokeStyle = 'rgba(0, 49, 83, 1)';
                                cachedContext.strokeStyle = 'rgba(0, 49, 83, 1)';
                            }
                            context.stroke();
                            cachedContext.stroke();
                            cachedCanvases[step] = cachedCanvas;
                            window.requestAnimationFrame(strokePoints.bind(null, stepEr + step));
                            stepEr += 1;
                            cachedKeys = _.keys(cachedCanvases);
                            Canvas.scrollIndex = cachedKeys.length - 1;
                            Canvas.maxScrollIndex = cachedKeys.length - 1;
                        } else {
                            Canvas.doneDrawing = true;
                            $(window.document).find("body").css('overflow', 'visible');
                            downArrowEl.addClass("active");
                        }
                    };
                    strokePoints(0);
                };
                window.setTimeout(draw, 2000);
                var previousScrollIndex = Canvas.maxScrollIndex;
                var animationLength = Home.height - window.innerHeight;
                var normalize = function(currentScroll) {
                    var num = Math.round(((animationLength-currentScroll)/(animationLength))*(Canvas.maxScrollIndex));
                    if (num < 0) {return 0;}
                    else if (num > Canvas.maxScrollIndex) {return Canvas.maxScrollIndex;}
                    else {return num;}
                };
                var mouseWheelCB = function() {
                    Canvas.scrollIndex = normalize(window.scrollY);
                    if (Canvas.doneDrawing && Canvas.scrollIndex !== previousScrollIndex) {
                        previousScrollIndex = Canvas.scrollIndex;
                        window.requestAnimationFrame(function(index) {
                            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                            context.drawImage(cachedCanvases[cachedKeys[index]], 0, 0);
                        }.bind(null, Canvas.scrollIndex));
                    }
                };
                var arrowClickCB1 = function() {
                    downArrowEl.off('click', arrowClickCB1).addClass("show-help");

                };
                downArrowEl.on('click', arrowClickCB1);
                $(window).on('mousewheel', _.throttle(mouseWheelCB, 25, {trailing: true, leading: true}));
            };
            return {
                init: init,
                doneDrawing: false,
                scrollIndex: 0,
                maxScrollIndex: 0
            };
        })();
        Home.Canvas = Canvas;
    })(Home = CS.Home || (CS.Home = {}));
})(CS || (CS = {}));
