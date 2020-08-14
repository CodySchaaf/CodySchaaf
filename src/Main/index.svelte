<style>
  .intro-container {
    position: relative;
    height: 10000px;
  }
  .intro-container .intro {
    width: 100%;
    position: absolute;
    bottom: 0;
  }
  .intro-container .intro.introFixed {
    position: fixed;
  }

  .about-me-container {
    background: rgba(251, 250, 249, 0.8);
    z-index: 2;
    position: relative;
    box-shadow: 0 0 10px lightgray;
  }
  .about-me-container .about-me {
    padding: 50px 20px;
  }
</style>

<script lang="ts">
  import Arrow from '../Arrow/index.svelte';
  import Schaaf from '../Schaaf/index.svelte';
  import Cody from '../Cody/index.svelte';
  import { onMount } from 'svelte';
  import { heightStore } from './store';

  let sectionsContainerHeight: number;

  let introEl: HTMLElement;
  let sectionsContainerEl: HTMLElement;
  let introFixed: boolean;
  let stopScroll = true;

  const handleScroll = () => {
    introFixed = window.scrollY + window.innerHeight < $heightStore;
  };

  const handleResize = () => {
    heightStore.set(window.innerHeight * 5);

    const footerHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--footer-height',
      ),
    );

    sectionsContainerHeight =
      window.innerHeight - footerHeight > sectionsContainerEl.offsetHeight
        ? window.innerHeight - footerHeight
        : sectionsContainerEl.offsetHeight;
  };

  onMount(handleResize);
  onMount(handleScroll);
</script>

<svelte:window on:resize="{handleResize}" on:scroll="{handleScroll}" />
<main class:stopScroll>
  <div>
    <section class="intro-container" style="height: {$heightStore}px;">
      <div
        class="intro"
        class:introFixed
        bind:this="{introEl}"
        style="height: {window.innerHeight}px;"
      >
        <h1>
          <Cody />
          <Schaaf />
        </h1>
        <Arrow height="{$heightStore}" />
      </div>
    </section>
    <section
      class="sections-container"
      bind:this="{sectionsContainerEl}"
      style="height: {sectionsContainerHeight}px;"
    >
      <div class="about-me-container">
        <div class="about-me container">
          <h2 class="text-center">Welcome!</h2>
          <hr />
          <h3 class="h4">About Me</h3>

          <p>
            You've probably already figured this out, but my name is Cody
            Schaaf. I'm a full stack engineer at Sigfig. My expertise is in
            Angular and Scala, and am experienced in Ruby on Rails, React,
            JQuery and many more, but my true skills reside in my ability to
            pick up any language or framework quickly and efficiently. My
            passion is obtaining deep understanding of all the technologies I
            work with. Which allows me to take full advantage of them, as well
            as become the person people turn to for help allowing my team to be
            as affective as possible.
          </p>
        </div>
      </div>
    </section>
  </div>

</main>
