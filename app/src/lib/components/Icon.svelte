<script lang="ts">
  let {
    name,
    size = 24,
    strokeWidth = 1.8,
  }: { name: string; size?: number; strokeWidth?: number } = $props();

  const paths: Record<string, string[]> = {
    home: ['M3 10.5 12 3l9 7.5', 'M5 9.8V21h14V9.8'],
    workspace: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
    assistant: [
      'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z',
      'M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z',
    ],
    reports: ['M6 3h8l4 4v14H6z', 'M9 12h6', 'M9 16h4'],
    more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
    back: ['M15 5l-7 7 7 7'],
    menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
    lock: ['M7 11h10v9H7z', 'M9 11V8a3 3 0 0 1 6 0v3'],
    check: ['M5 12l4 4L19 6'],
    chevron: ['M9 6l6 6-6 6'],
    send: ['M22 2 11 13', 'M22 2 15 22l-4-9-9-4z'],
  };

  let current = $derived(paths[name] ?? []);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#each current as d (d)}
    <path {d} />
  {/each}
</svg>
