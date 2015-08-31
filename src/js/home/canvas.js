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

                var max = 1000;
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
                _.forOwn(pointsStartFn(), function(points, letter) {
                    var cachedCanvas = document.createElement('canvas');
                    cachedCanvas.width = context.canvas.width;
                    cachedCanvas.height = context.canvas.height;
                    var cachedContext = cachedCanvas.getContext('2d');
                    moveTo(points, cachedContext);
                    var start = currentStart(letter);
                    var end = currentEnd(letter);
                    var diffX = end[0] - start[0];
                    var stepSizeX = diffX/max;
                    var diffY = end[1] - start[1];
                    var stepSizeY = diffY/max;
                    stepSizeX = stepSizeX !== 0 ? 5 : 0;
                    stepSizeY = stepSizeY !== 0 ? 5 : 0;
                    context.lineTo(start[0] + stepSizeX, start[1] + stepSizeY);
                    cachedContext.lineTo(start[0] + stepSizeX, start[1] + stepSizeY);

                    context.strokeStyle = "#003153";
                    cachedContext.strokeStyle = "#003153";
                    context.lineWidth = 2;
                    cachedContext.lineWidth = 2;
                    context.stroke();
                    cachedContext.stroke();
                    cachedCanvases[0] = cachedCanvas;
                });

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
                            $(".arrow-down").removeClass("inactive");
                            setTimeout(function() {
                                $(".arrow-down").addClass("active");
                            }, 1000);
                        }
                    };
                    strokePoints(1);
                };
                window.setTimeout(draw, 2000);
                var updateArrow = function() {
                    $(".arrow-down").removeClass("active");
                    $(".arrow-down").css({transform: 'translate(0px,0px)'});
                    $(".intro").hide();
                    window.requestAnimationFrame(function() {
                        $(".arrow-down").css({transform: 'translate(0px,'+ (-$(".arrow-down").offset().top+20) +'px)'});
                        $(".arrow-down").addClass("inactive");
                        $(".about-me").css({transform: 'none'});
                        setTimeout(function() {
                            $(window.document).find("body").css('overflow', 'visible');
                        },1000);
                    });
                };
                var CB = function(event, direction) {
                    console.log(Canvas.scrollIndex);
                    if (Canvas.doneDrawing) {
                        if (direction <= 0 && Canvas.scrollIndex >= 0) {
                            if (Canvas.scrollIndex === 0) {
                                Canvas.scrollIndex -= 1;
                                window.requestAnimationFrame(function() {
                                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                                });
                            } else {
                                Canvas.scrollIndex -= 1;
                                window.requestAnimationFrame(function(index) {
                                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                                    context.drawImage(cachedCanvases[cachedKeys[index]], 0, 0);
                                }.bind(null, Canvas.scrollIndex));
                            }
                        } else if (direction >= 0 && Canvas.scrollIndex < cachedKeys.length - 1 && Canvas.scrollIndex >= 0) {
                            Canvas.scrollIndex += 1;
                            window.requestAnimationFrame(function(index) {
                                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                                context.drawImage(cachedCanvases[cachedKeys[index]], 0, 0);
                            }.bind(null, Canvas.scrollIndex));
                        } else if (direction <= 0 && Canvas.scrollIndex <= 0) {
                            Canvas.scrollIndex -= 1; //used in svg
                            updateArrow();
                            $(window).off('mousewheel');
                            $('.arrow-down').off('click');
                        }
                    }
                };
                var mouseWheelCB = function(event) {
                    CB(event, event.originalEvent.wheelDelta);
                };
                var arrowClickCB2 = function(event) {
                    $('#eventDelegator').trigger('SVG:clear');
                    $('.arrow-down').off('click', arrowClickCB2);
                    window.requestAnimationFrame(function(index) {
                        CB(event, -1);
                        if (Canvas.scrollIndex >= -1) {
                            arrowClickCB2();
                        }
                    });
                };
                var arrowClickCB1 = function(event) {
                    $('.arrow-down').off('click', arrowClickCB1).on('click', arrowClickCB2).addClass("show-help");

                };
                $('.arrow-down').on('click', arrowClickCB1);
                $(window).on('mousewheel', _.throttle(mouseWheelCB, 25, {trailing: true, leading: true}));
                $(".about-me").css({transform: 'translate(0px,'+ ($(".arrow-down").offset().top+20) +'px)'}).addClass('ready');

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
