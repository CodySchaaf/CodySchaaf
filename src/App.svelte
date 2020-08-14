<style>
  :root {
    --color-5: #423d3b;
    --color-4: #827e7b;
    --color-2: #6e6c6a;
    --color-1: #f0eee8;

    --dark-wash: #f7f6f3;
    --light-wash: #fbfaf9;

    --accent: #003153;
  }

  .stopScroll {
    overflow: hidden;
  }
</style>

<script lang="ts">
  import Header from './Header/index.svelte';
  import Main from './Main/index.svelte';
  import Footer from './Footer/index.svelte';
  import Background from './Background/index.svelte';
  import { renderWatcher } from './Cody/store';
  import { onMount } from 'svelte';

  let stopScroll = true;

  const unsubscribe = renderWatcher.subscribe(({ doneDrawing }) => {
    if (doneDrawing) {
      stopScroll = false;
      unsubscribe();
    }
  });

  onMount(() => {
    window.scrollTo(0, 0);
    setTimeout(function () {
      window.scrollTo(0, 0);
    });
  });
</script>

<div class:stopScroll style="height: 100%;">
  <Background />
  <Header />
  <Main />
  <Footer />
</div>
