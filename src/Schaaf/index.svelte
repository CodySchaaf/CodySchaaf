<style>
  svg {
    display: block;
    margin: auto;
  }
  svg path.active {
    animation: dash 0.6s ease-in-out forwards;
  }
  svg .svg-group {
    transition: fill-opacity 1s ease-in-out;
    fill-opacity: 0;
  }
  .svg-group.fillSvg {
    fill-opacity: 1;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { styles } from '../lib/styles';
  import { renderWatcher } from '../Cody/store';

  const characters: SVGPathElement[] = [];
  let characterStyles: Record<string, number>[] = [];
  let activeCharacters: boolean[] = [];
  let hidden = true;
  let fillSvg = false;

  onMount(() => {
    characterStyles = characters.map(character => ({
      'stroke-dasharray': character.getTotalLength(),
      'stroke-dashoffset': character.getTotalLength(),
    }));
    hidden = false;
    const delay = 0.6 * 1000;
    characters.forEach((_, index) => {
      setTimeout(() => {
        activeCharacters[index] = true;
      }, delay * index);
    });
    setTimeout(() => {
      characterStyles = characters.map(() => ({
        'stroke-dashoffset': 0
      }));
      activeCharacters = Array(activeCharacters.length).fill(false)
      fillSvg = true;
    }, delay * 6);
  });

  renderWatcher.subscribe(({ doneDrawing, scrollIndex, maxScrollIndex }) => {
    if (doneDrawing && scrollIndex && scrollIndex >= 0) {

      characterStyles = characters.map(character => ({
        'stroke-dasharray': character.getTotalLength(),
        'stroke-dashoffset':
          (character.getTotalLength() / (maxScrollIndex ?? 1)) *
          ((maxScrollIndex ?? 1) - scrollIndex),
      }));

      fillSvg = maxScrollIndex === scrollIndex;
    }
  });
</script>

<svg
  class:hidden
  role="banner"
  id="svg2"
  width="300"
  height="200"
  aria-describedby="schaaf"
  viewBox="0 0 1 500"
  preserveAspectRatio="xMinYMin meet"
>
  <title id="schaaf">Schaaf</title>
  <g id="layer1">
    <g
      id="text3336"
      style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:180px;line-height:125%;font-family:Quicksand;-inkscape-font-specification:'Quicksand,
      Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#003153;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
      class="svg-group"
      class:fillSvg
    >
      <path
        bind:this="{characters[0]}"
        class:active="{activeCharacters[0]}"
        use:styles="{characterStyles[0] ?? {}}"
        stroke="#003153"
        stroke-width="2"
        id="path3341"
        d="m 86.797143,97.322198 q 0.36,18.000002 36.359997,24.840002 l 0.36,0 q
        20.7,3.78 32.04,11.52 13.86,9 13.86,23.94 0,14.76 -14.04,24.84
        -13.86,10.08 -32.58,10.08 -23.759997,-0.18 -46.439997,-18.18 -2.88,-2.52
        -0.54,-5.58 1.08,-1.26 2.7,-1.44 1.62,-0.18 2.88,0.9 20.339997,16.38
        41.399997,16.2 16.56,0 27.72,-8.28 10.8,-7.74 10.8,-18.72 0,-20.16
        -39.42,-27.54 l -0.36,0 q -42.659997,-7.92 -42.659997,-32.580002
        0,-14.04 12.78,-23.4 12.959997,-9.36 30.779997,-9.36 7.74,0 15.48,2.7
        7.92,2.52 12.24,5.04 4.32,2.34 11.16,6.84 3.24,2.16 1.08,5.58 -1.98,3.24
        -5.4,1.08 -6.48,-4.14 -10.62,-6.48 -3.96,-2.34 -10.8,-4.5 -6.66,-2.34
        -13.14,-2.34 -15.12,0 -25.739997,7.56 -9.9,7.38 -9.9,17.28 z"
      ></path>
      <path
        bind:this="{characters[1]}"
        class:active="{activeCharacters[1]}"
        use:styles="{characterStyles[1] ?? {}}"
        stroke="#003153"
        stroke-width="2"
        id="path3343"
        d="m 238.89152,192.3622 q -18.9,0 -32.22,-12.78 -13.14,-12.96
        -13.14,-31.32 0,-18.54 13.14,-31.32 13.32,-12.78 30.6,-12.78 17.46,0
        29.7,9.72 1.44,0.9 1.62,2.7 0.18,1.8 -1.08,3.24 -2.7,3.06 -5.94,0.72
        -9.9,-7.92 -23.94,-7.92 -14.04,0 -24.84,10.44 -10.62,10.44 -10.62,25.2
        0,14.76 10.62,25.2 10.8,10.26 24.66,10.26 14.04,0 24.12,-7.74 3.24,-2.34
        5.94,0.9 2.88,3.24 -0.9,6.12 -12.06,9.36 -27.72,9.36 z"
      ></path>
      <path
        bind:this="{characters[2]}"
        class:active="{activeCharacters[2]}"
        use:styles="{characterStyles[2] ?? {}}"
        stroke="#003153"
        stroke-width="2"
        id="path3345"
        d="m 308.05933,192.3622 -0.9,0 q -4.32,0 -4.32,-4.32 l 0,-117.360002 q
        0,-1.8 1.26,-3.06 1.26,-1.26 3.06,-1.26 1.8,0 3.06,1.26 1.44,1.26
        1.44,3.06 l 0,46.440002 q 10.98,-12.96 27.18,-12.96 16.2,0 26.82,9.9
        10.8,9.72 10.8,24.84 l 0,49.14 q 0,1.8 -1.44,3.06 -1.26,1.26 -3.06,1.26
        -1.8,0 -3.06,-1.26 -1.26,-1.26 -1.26,-3.06 l 0,-49.14 q 0,-11.34
        -8.1,-18.54 -8.1,-7.38 -19.98,-7.38 -11.7,0 -19.8,7.38 -8.1,7.2
        -8.1,18.54 l 0,49.68 q 0,0.36 -0.72,1.8 -0.72,1.26 -2.52,1.8 -0.18,0.18
        -0.36,0.18 z"
      ></path>
      <path
        bind:this="{characters[3]}"
        class:active="{activeCharacters[3]}"
        use:styles="{characterStyles[3] ?? {}}"
        stroke="#003153"
        stroke-width="2"
        id="path3347"
        d="m 479.82996,105.4222 q 1.26,-1.26 3.06,-1.26 1.8,0 3.06,1.26
        1.26,1.26 1.26,3.06 l 0,79.56 q 0,1.8 -1.26,3.06 -1.26,1.26 -3.06,1.26
        -1.8,0 -3.06,-1.26 -1.26,-1.26 -1.26,-3.06 l 0,-13.14 q -5.76,8.1
        -14.58,12.78 -8.64,4.68 -18.54,4.68 -17.28,0 -29.52,-12.96 -12.24,-12.96
        -12.24,-31.14 0,-18.18 12.24,-31.14 12.24,-12.96 29.52,-12.96 9.9,0
        18.54,4.68 8.82,4.68 14.58,12.6 l 0,-12.96 q 0,-1.8 1.26,-3.06 z m
        -67.5,42.84 q 0,14.76 9.72,25.2 9.9,10.26 23.4,10.26 13.68,0 23.4,-10.26
        9.72,-10.44 9.72,-25.2 0,-14.76 -9.72,-25.2 -9.72,-10.44 -23.4,-10.44
        -13.5,0 -23.4,10.44 -9.72,10.44 -9.72,25.2 z"
      ></path>
      <path
        bind:this="{characters[4]}"
        class:active="{activeCharacters[4]}"
        use:styles="{characterStyles[4] ?? {}}"
        stroke="#003153"
        stroke-width="2"
        id="path3349"
        d="m 590.92371,105.4222 q 1.26,-1.26 3.06,-1.26 1.8,0 3.06,1.26
        1.26,1.26 1.26,3.06 l 0,79.56 q 0,1.8 -1.26,3.06 -1.26,1.26 -3.06,1.26
        -1.8,0 -3.06,-1.26 -1.26,-1.26 -1.26,-3.06 l 0,-13.14 q -5.76,8.1
        -14.58,12.78 -8.64,4.68 -18.54,4.68 -17.28,0 -29.52,-12.96 -12.24,-12.96
        -12.24,-31.14 0,-18.18 12.24,-31.14 12.24,-12.96 29.52,-12.96 9.9,0
        18.54,4.68 8.82,4.68 14.58,12.6 l 0,-12.96 q 0,-1.8 1.26,-3.06 z m
        -67.5,42.84 q 0,14.76 9.72,25.2 9.9,10.26 23.4,10.26 13.68,0 23.4,-10.26
        9.72,-10.44 9.72,-25.2 0,-14.76 -9.72,-25.2 -9.72,-10.44 -23.4,-10.44
        -13.5,0 -23.4,10.44 -9.72,10.44 -9.72,25.2 z"
      ></path>
      <path
        bind:this="{characters[5]}"
        class:active="{activeCharacters[5]}"
        use:styles="{characterStyles[5] ?? {}}"
        stroke="#003153"
        stroke-width="2"
        id="path3351"
        d="m 669.97746,66.542198 q 1.8,0 3.06,1.44 1.26,1.26 1.26,3.06 0,1.8
        -1.26,3.06 -1.26,1.26 -3.06,1.26 -8.28,0 -11.52,3.78 -3.24,3.6
        -3.24,14.22 l 0,9.360002 12.42,0 q 1.8,0 3.06,1.26 1.44,1.26 1.44,3.06
        0,1.8 -1.44,3.24 -1.26,1.26 -3.06,1.26 l -12.42,0 0,76.68 q 0,1.8
        -1.26,3.06 -1.26,1.26 -3.06,1.26 -1.8,0 -3.24,-1.26 -1.26,-1.26
        -1.26,-3.06 l 0,-76.68 -11.7,0 q -1.8,0 -3.06,-1.26 -1.26,-1.44
        -1.26,-3.24 0,-1.8 1.26,-3.06 1.26,-1.26 3.06,-1.26 l 11.7,0 0,-9.360002
        q 0.36,-14.04 5.76,-20.52 5.76,-6.3 17.82,-6.3 z"
      ></path>
    </g>
  </g>
</svg>
