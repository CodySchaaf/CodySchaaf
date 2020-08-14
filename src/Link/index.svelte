<style>
  .link {
    text-decoration: none;
    color: var(--color-2);
    position: relative;
  }

  .link:after {
    text-align: justify;
    display: inline-block;
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    white-space: nowrap;
    overflow: hidden;
    color: var(--accent);
    min-height: 100%;
    width: 0;
    max-width: 100%;
    transition: 0.3s;
  }

  .link:hover {
    color: var(--color-2);
  }
  .link:hover:after {
    width: 100%;
  }
</style>

<script lang="ts">
  export let text: string;
  export let href: string;

  // TODO WTF
  function handleTouch() {
    setTimeout(() => {
      window.location.href = href;
    }, 400);
  }
</script>

<a class="link" on:touchend="{handleTouch}" data-text="{text}" href="{href}">
  {text}
</a>
