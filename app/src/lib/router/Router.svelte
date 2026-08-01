<script lang="ts">
  import type { Component } from 'svelte';
  import { route } from './index';
  import { matchRoute } from './routes';

  let current = $derived(matchRoute($route));
  let Page: Component = $derived(current.route.component);
</script>

<Page params={current.params} />
