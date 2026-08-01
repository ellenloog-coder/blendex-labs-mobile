<script lang="ts">
  interface Props {
    variant?: 'default' | 'search';
    label?: string;
    placeholder?: string;
    value?: string;
    type?: 'text' | 'number' | 'textarea';
    disabled?: boolean;
    oninput?: (event: Event) => void;
  }

  let {
    variant = 'default',
    label,
    placeholder,
    value = '',
    type = 'text',
    disabled = false,
    oninput,
  }: Props = $props();
</script>

<label class="field">
  {#if label}
    <span class="field-label">{label}</span>
  {/if}
  {#if type === 'textarea'}
    <textarea {placeholder} {value} {disabled} rows="4" class="input textarea" oninput={oninput}></textarea>
  {:else}
    <input
      {type}
      {placeholder}
      {value}
      {disabled}
      class="input"
      class:search={variant === 'search'}
      oninput={oninput}
    />
  {/if}
</label>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field-label {
    font-size: var(--font-size-body);
    color: var(--color-secondary);
  }
  .input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: var(--radius-input);
    background: var(--color-surface);
    padding: 12px 14px;
    font-size: 14px;
    color: var(--color-ink);
  }
  .input::placeholder {
    color: var(--color-faint);
  }
  .input:disabled {
    background: var(--color-fill);
    opacity: 0.7;
  }
  .input.search {
    height: 52px;
    border-radius: 16px;
  }
  .textarea {
    resize: vertical;
  }
</style>
