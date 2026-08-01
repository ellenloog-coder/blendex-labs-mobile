<script lang="ts">
  import type { Snippet } from 'svelte';

  type Status =
    | 'completed'
    | 'needs-review'
    | 'draft'
    | 'failed'
    | 'available'
    | 'beta'
    | 'coming-soon';

  let { status, children }: { status: Status; children?: Snippet } = $props();
</script>

<span class="badge badge-{status}">{@render children?.()}</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 10px;
    border-radius: var(--radius-chip);
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
  }
  .badge-completed {
    background: var(--color-success-bg);
    color: var(--color-success);
  }
  .badge-needs-review {
    background: var(--color-warning-bg);
    color: var(--color-warning);
  }
  .badge-failed {
    background: var(--color-danger-bg);
    color: var(--color-danger);
  }
  .badge-draft,
  .badge-coming-soon {
    background: var(--color-fill);
    color: var(--color-secondary);
  }
  .badge-available {
    background: var(--color-brand-soft);
    color: var(--color-brand);
  }
  .badge-beta {
    background: var(--color-success-bg);
    color: var(--color-success);
  }
</style>
