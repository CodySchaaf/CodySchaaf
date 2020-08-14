<style>
  :root {
    --footer-height: 95px;
  }

  .footer {
    height: var(--footer-height);
    border-top: 1px solid var(--color-2);
    background: white;
    padding: 25px;
  }
</style>

<script lang="ts">
  import Link from '../Link/index.svelte';
</script>

<footer class="footer">
  <div>
    <Link href="http://blog.codyschaaf.com" text="My Blog" />
  </div>
  <small>
    © {new Date().getFullYear()}, Built with
    <Link href="https://svelte.dev/" text="Svelte" />
  </small>

</footer>
