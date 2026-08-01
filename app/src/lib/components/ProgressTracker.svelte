<script lang="ts">
  type StepState = 'done' | 'current' | 'todo';

  interface Step {
    label: string;
    state?: StepState;
  }

  let { steps }: { steps: Step[] } = $props();
</script>

<ol class="tracker">
  {#each steps as step, i (step.label)}
    <li class="step" class:done={step.state === 'done'} class:current={step.state === 'current'}>
      <span class="step-dot tabular">{step.state === 'done' ? '✓' : i + 1}</span>
      {#if step.label}
        <span class="step-label">{step.label}</span>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .tracker {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .step-dot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--color-hairline);
    color: var(--color-secondary);
    font-size: 12px;
    font-weight: var(--font-weight-bold);
  }
  .step.done .step-dot {
    background: var(--color-success);
    color: var(--color-surface);
  }
  .step.current .step-dot {
    background: var(--color-ink);
    color: var(--color-surface);
  }
  .step-label {
    font-size: 10px;
    color: var(--color-secondary);
  }
</style>
