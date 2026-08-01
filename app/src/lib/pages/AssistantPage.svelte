<script lang="ts">
  import { get } from 'svelte/store';
  import { onDestroy } from 'svelte';
  import Button from '../components/Button.svelte';
  import Chip from '../components/Chip.svelte';
  import Icon from '../components/Icon.svelte';
  import {
    demoPopularTopics,
    demoRecentConversations,
    pickDemoReply,
  } from '../demo/preview-data';
  import type { DemoConversationItem } from '../demo/preview-data';
  import { t } from '../i18n';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    text: string;
    demo?: boolean;
  }

  let messages = $state<ChatMessage[]>([]);
  let draft = $state('');
  let replyTimer: ReturnType<typeof setTimeout> | undefined;
  let nextId = 1;

  const suggestionChips = ['Cpk', 'SPC', '8D', 'MSA'];

  function push(role: ChatMessage['role'], text: string, demo = false): void {
    messages = [...messages, { id: nextId++, role, text, demo }];
  }

  function sendMessage(content?: string): void {
    const text = (content ?? draft).trim();
    if (!text) return;
    push('user', text);
    draft = '';
    if (replyTimer) clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      push('assistant', get(t)(pickDemoReply(text)), true);
    }, 600);
  }

  function onInput(event: Event): void {
    draft = (event.currentTarget as HTMLInputElement).value;
  }

  function startConversation(item: DemoConversationItem): void {
    messages = [];
    push('user', get(t)(item.titleKey));
    if (replyTimer) clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      push('assistant', get(t)(pickDemoReply(item.titleKey)), true);
    }, 600);
  }

  onDestroy(() => {
    if (replyTimer) clearTimeout(replyTimer);
  });
</script>

<section class="page assistant">
  <header class="hero">
    <span class="sparkle"><Icon name="assistant" size={38} strokeWidth={1.4} /></span>
    <h2 class="title">{$t('assistant.title')}</h2>
    <p class="subtitle">{$t('assistant.subtitle1')}</p>
    <p class="subtitle">{$t('assistant.subtitle2')}</p>
  </header>

  {#if messages.length > 0}
    <div class="thread" aria-label={$t('assistant.conversation')}>
      {#each messages as message (message.id)}
        <div class="bubble bubble-{message.role}">
          {#if message.role === 'assistant'}
            <span class="role-label">{$t('assistant.demoLabel')}</span>
          {/if}
          <p>{message.text}</p>
        </div>
      {/each}
    </div>
  {:else}
    <div class="chips">
      {#each suggestionChips as chip (chip)}
        <Chip variant="suggestion" onclick={() => sendMessage(chip)}>
          {chip}
        </Chip>
      {/each}
    </div>
  {/if}

  <div class="composer">
    <input
      class="composer-input"
      placeholder={$t('assistant.placeholder')}
      value={draft}
      oninput={onInput}
      onkeydown={(event) => {
        if (event.key === 'Enter') sendMessage();
      }}
    />
    <Button variant="icon" ariaLabel={$t('assistant.send')} onclick={() => sendMessage()}>
      <Icon name="send" size={20} />
    </Button>
  </div>

  <section class="block">
    <h3 class="block-title">{$t('assistant.recentConversations')}</h3>
    <div class="conversations">
      {#each demoRecentConversations as item (item.id)}
        <button class="conversation" onclick={() => startConversation(item)}>
          <span class="conv-title">{$t(item.titleKey)}</span>
          <span class="conv-summary">{$t(item.summaryKey)}</span>
          <span class="conv-time">{$t(item.timeKey)}</span>
        </button>
      {/each}
    </div>
  </section>

  <section class="block">
    <h3 class="block-title">{$t('assistant.popularTopics')}</h3>
    <div class="topics">
      {#each demoPopularTopics as topic (topic)}
        <button class="topic" onclick={() => sendMessage(get(t)(topic))}>
          {$t(topic)}
        </button>
      {/each}
    </div>
  </section>

  <p class="note note-center">{$t('assistant.demoNotice')}</p>
</section>

<style>
  .assistant {
    align-items: stretch;
  }
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }
  .sparkle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-bottom: 8px;
    border-radius: 50%;
    background: var(--color-brand-soft);
    color: var(--color-brand);
  }
  .title {
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-extrabold);
    color: var(--color-ink);
  }
  .subtitle {
    font-size: 15px;
    color: var(--color-secondary);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  .thread {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bubble {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.55;
  }
  .bubble-user {
    align-self: flex-end;
    background: var(--color-brand);
    color: var(--color-surface);
    border-bottom-right-radius: 4px;
  }
  .bubble-assistant {
    align-self: flex-start;
    background: var(--color-surface);
    color: var(--color-body);
    box-shadow: var(--shadow-card);
    border-bottom-left-radius: 4px;
  }
  .role-label {
    display: block;
    margin-bottom: 4px;
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    color: var(--color-brand);
  }
  .bubble p {
    margin: 0;
  }
  .composer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 16px;
    border-radius: 25px;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }
  .composer-input {
    flex: 1;
    min-width: 0;
    height: 38px;
    border: none;
    background: none;
    font-size: 14px;
    color: var(--color-ink);
    outline: none;
  }
  .composer-input::placeholder {
    color: var(--color-faint);
  }
  .composer :global(.btn-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--color-brand);
    color: var(--color-surface);
  }
  .conversations {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .conversation {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-height: 62px;
    padding: 10px 14px;
    border: none;
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: left;
  }
  .conv-title {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .conv-summary {
    font-size: 12px;
    color: var(--color-secondary);
  }
  .conv-time {
    font-size: var(--font-size-meta);
    color: var(--color-faint);
  }
  .topics {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .topic {
    height: 30px;
    padding: 0 12px;
    border: none;
    border-radius: var(--radius-chip);
    background: var(--color-fill);
    color: var(--color-secondary);
    font-size: 12px;
  }
  .note-center {
    text-align: center;
  }
</style>
