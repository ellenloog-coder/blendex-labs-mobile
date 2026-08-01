<script lang="ts">
  let { message }: { message: string } = $props();
</script>

<div class="empty">
  <span class="dot-grid" aria-hidden="true"></span>
  <p>{message}</p>
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 28px 16px;
    text-align: center;
    color: var(--color-faint);
    font-size: 13px;
  }
  .dot-grid {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    background:
      radial-gradient(circle at 0 0, var(--color-faint) 4px, transparent 4px) 0 0 / 10px 10px,
      radial-gradient(circle at 0 0, var(--color-faint) 4px, transparent 4px) 10px 10px / 10px 10px;
  }
</style>
