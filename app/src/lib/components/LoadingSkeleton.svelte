<script lang="ts">
  type Variant = 'title' | 'paragraph' | 'image' | 'list';

  let { variant = 'paragraph' }: { variant?: Variant } = $props();
</script>

<div class="skeleton skeleton-{variant}" aria-hidden="true"></div>

<style>
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--color-fill) 25%,
      var(--color-hairline) 50%,
      var(--color-fill) 75%
    );
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: 8px;
  }
  .skeleton-title {
    height: 28px;
    width: 60%;
  }
  .skeleton-paragraph {
    height: 14px;
    width: 100%;
  }
  .skeleton-image {
    height: 160px;
    width: 100%;
  }
  .skeleton-list {
    height: 48px;
    width: 100%;
  }
  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
</style>
