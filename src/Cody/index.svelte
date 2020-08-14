<style>
  .canvas-container {
    width: 60%;
    position: relative;
    display: block;
    left: 20%;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { pointsEndFn, pointsStartFn } from './canvas-helpers';
  import { heightStore } from '../Main/store';
  import { renderWatcher } from './store';
  import throttle from 'lodash.throttle';

  // var throttledScrollCB;
  // var animationFrameRequestId;

  const cachedCanvases: Record<string, HTMLCanvasElement> = {};

  let parent: HTMLElement;
  let canvasElement: HTMLCanvasElement;

  let doneDrawing = false;
  let scrollIndex = 0;
  let maxScrollIndex = 0;
  let scrollCB: () => void;
  onMount(() => {
    canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;

    const context = canvasElement.getContext('2d')!;
    context.canvas.width = parent.offsetWidth;
    context.canvas.height = 300;
    const canvasWidth = canvasElement.width;
    const canvasHeight = canvasElement.height;
    const baseYOffset = canvasHeight / 2;

    const baseXOffset = canvasWidth / 5;
    const cXOffset = baseXOffset;
    const oXOffset = baseXOffset * 2;
    const dXOffset = baseXOffset * 3;
    const yXOffset = baseXOffset * 4;

    const letterSize =
      (baseXOffset < baseYOffset ? baseXOffset : baseYOffset) / 3;
    const letterYSize = letterSize;
    const letterXSize = letterSize / 2;

    const max = 2000;
    let cachedKeys = ['0'];
    const currentStart = function (
      letter: keyof ReturnType<typeof pointsStartFn>,
    ) {
      return pointsStartFn({
        canvasWidth,
        letterXSize,
        letterYSize,
        baseYOffset,
        cXOffset,
        oXOffset,
        dXOffset,
        yXOffset,
      })[letter];
    };
    const currentEnd = function (letter: keyof ReturnType<typeof pointsEndFn>) {
      return pointsEndFn({
        canvasWidth,
        letterXSize,
        letterYSize,
        baseYOffset,
        cXOffset,
        oXOffset,
        dXOffset,
        yXOffset,
      })[letter];
    };
    const moveTo = function (
      points: number[],
      cachedContext: CanvasRenderingContext2D,
    ) {
      context.moveTo(points[0], points[1]);
      cachedContext.moveTo(points[0], points[1]);
    };
    const lineTo = function (
      letter: keyof ReturnType<typeof pointsStartFn>,
      step: number,
      cachedContext: CanvasRenderingContext2D,
    ) {
      const start = currentStart(letter);
      const end = currentEnd(letter);
      const diffX = end[0] - start[0];
      const stepSizeX = diffX / max;
      const diffY = end[1] - start[1];
      const stepSizeY = diffY / max;
      context.lineTo(start[0] + stepSizeX * step, start[1] + stepSizeY * step);
      cachedContext.lineTo(
        start[0] + stepSizeX * step,
        start[1] + stepSizeY * step,
      );
    };
    const cachedCanvas = document.createElement('canvas');
    cachedCanvas.width = context.canvas.width;
    cachedCanvas.height = context.canvas.height;
    cachedCanvases[0] = cachedCanvas;

    const draw = function () {
      let stepEr = 0;
      const strokePoints = function (step: number) {
        const oldCachedCanvas = cachedCanvases[cachedKeys[scrollIndex]];
        const cachedCanvas = document.createElement('canvas');
        const cachedContext = cachedCanvas.getContext('2d')!;

        //set dimensions
        cachedCanvas.width = oldCachedCanvas.width;
        cachedCanvas.height = oldCachedCanvas.height;

        //apply the old canvas to the new one
        cachedContext.drawImage(oldCachedCanvas, 0, 0);

        if (step < max) {
          Object.entries(
            pointsStartFn({
              canvasWidth,
              letterXSize,
              letterYSize,
              baseYOffset,
              cXOffset,
              oXOffset,
              dXOffset,
              yXOffset,
            }),
          ).map(([letter, points]) => {
            moveTo(points, cachedContext);
            lineTo(
              letter as keyof ReturnType<typeof pointsStartFn>,
              step,
              cachedContext,
            );
            context.lineWidth = 2;
            cachedContext.lineWidth = 2;
          });

          if (step / max >= 1 / 8) {
            context.strokeStyle =
              'rgba(0, 49, 83, ' + 1 / 8 / (step / max) + ')';
            cachedContext.strokeStyle =
              'rgba(0, 49, 83, ' + 1 / 8 / (step / max) + ')';
          } else {
            context.strokeStyle = 'rgba(0, 49, 83, 1)';
            cachedContext.strokeStyle = 'rgba(0, 49, 83, 1)';
          }
          context.stroke();
          cachedContext.stroke();
          cachedCanvases[step] = cachedCanvas;
          // animationFrameRequestId = window.requestAnimationFrame(
          window.requestAnimationFrame(strokePoints.bind(null, stepEr + step));
          stepEr += 1;
          cachedKeys = Object.keys(cachedCanvases);
          scrollIndex = cachedKeys.length - 1;
          maxScrollIndex = cachedKeys.length - 1;
        } else {
          doneDrawing = true;
          renderWatcher.set({ doneDrawing });
        }
      };
      strokePoints(0);
    };

    window.setTimeout(draw, 2000);

    //start of something else
    let previousScrollIndex = maxScrollIndex;
    const normalize = (currentScroll: number) => {
      const animationLength = $heightStore - window.innerHeight;
      const num = Math.round(
        ((animationLength - currentScroll) / animationLength) * maxScrollIndex,
      );
      if (num < 0) {
        return 0;
      } else if (num > maxScrollIndex) {
        return maxScrollIndex;
      } else {
        return num;
      }
    };
    scrollCB = throttle(
      () => {
        scrollIndex = normalize(window.scrollY);
        if (doneDrawing && scrollIndex !== previousScrollIndex) {
          previousScrollIndex = scrollIndex;
          window.requestAnimationFrame(() => {
            context.clearRect(
              0,
              0,
              context.canvas.width,
              context.canvas.height,
            );
            context.drawImage(cachedCanvases[cachedKeys[scrollIndex]], 0, 0);
            renderWatcher.set({ doneDrawing, maxScrollIndex, scrollIndex });
          });
        }
      },
      25,
      { trailing: true, leading: true },
    );
  });
</script>

<svelte:window on:scroll="{scrollCB}" />
<span class="canvas-container" bind:this="{parent}">
  <canvas
    id="myCanvas"
    bind:this="{canvasElement}"
    role="banner"
    aria-describedby="cody"
    width="100%"
    height="100%"
  >
    <span id="cody">Cody</span>
  </canvas>
</span>
