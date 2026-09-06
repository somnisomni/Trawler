<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<script lang="ts">
import favicon from "$lib/assets/favicon.svg";

const { children } = $props();
</script>
