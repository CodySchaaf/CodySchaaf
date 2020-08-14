<style>
  .background {
    position: fixed;
    height: 100%;
    width: 100%;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import Particles from 'particlesjs';

  onMount(() => {
    Particles.init({
      selector: '.background',
      connectParticles: true,
      color: getComputedStyle(document.documentElement).getPropertyValue(
        '--accent',
      ),
      maxParticles: 40,
    });
  });
</script>

<canvas class="background" style="opacity: .3;"></canvas>
