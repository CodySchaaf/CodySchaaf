<style>
  .arrow-down {
    width: 100%;
    position: absolute;
    bottom: 10px;
    opacity: 0;
    transition: opacity 1s ease-in-out, top 1s ease-in-out,
      transform 1s ease-in-out;
  }

  .arrow-down .arrow {
    margin: auto;
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 20px solid var(--accent);
  }
  .arrow-down.active {
    opacity: 1;
  }
  .arrow-down.active .arrow {
    animation: pulse 1.2s ease-in-out infinite alternate;
  }
  .arrow-down.showHelp .help {
    opacity: 1;
  }
  .arrow-down .help {
    text-align: center;
    margin-bottom: 20px;
    transition: opacity 1s ease-in-out;
    opacity: 0;
  }
  @keyframes pulse {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0.8;
      transform: scale(1.2);
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { reactDependencies } from '../utils';

  export let height: number;

  let arrowHeight: number;
  let downArrowEl: HTMLElement;

  let active = false;

  function handleScroll() {
    active = window.scrollY < height - arrowHeight;
  }

  $: if (downArrowEl) {
    reactDependencies(height);
    handleScroll();
  }

  let showHelp = false;
  const arrowClickCB1 = () => {
    showHelp = true;
  };

  onMount(() => (arrowHeight = downArrowEl.offsetHeight));
  onMount(handleScroll);
</script>

<svelte:body on:scroll="{handleScroll}" />
<div
  class="arrow-down"
  class:active
  bind:this="{downArrowEl}"
  on:click="{arrowClickCB1}"
  class:showHelp
>
  <div class="help">Scroll down after animation.</div>
  <div class="arrow" style="cursor: pointer;"></div>
</div>
