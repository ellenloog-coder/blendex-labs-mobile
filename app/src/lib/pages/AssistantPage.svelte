<script lang="ts">
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import Button from '../components/Button.svelte';
  import Chip from '../components/Chip.svelte';
  import Icon from '../components/Icon.svelte';
  import { askAssistant } from '../ai/gateway';
  import {
    appendMessage,
    createConversation,
    listConversations,
  } from '../ai/conversation-store';
  import type { Conversation, ConversationMessage } from '../ai/conversation-store';
  import { demoPopularTopics } from '../demo/preview-data';
  import { locale, t } from '../i18n';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  interface ChatMessage extends ConversationMessage {
    pending?: boolean;
    error?: boolean;
  }

  const suggestionChips = ['Cpk', 'SPC', '8D', 'MSA'];

  let messages = $state<ChatMessage[]>([]);
  let conversationId = $state<string | null>(null);
  let draft = $state('');
  let busy = $state(false);
  let lastQuestion = $state('');
  let recent = $state<Conversation[]>([]);

  onMount(async () => {
    recent = await listConversations(10);
  });

  async function ensureConversation(): Promise<string> {
    if (conversationId) return conversationId;
    const conversation = await createConversation();
    conversationId = conversation.id;
    return conversation.id;
  }

  async function sendMessage(content?: string): Promise<void> {
    const text = (content ?? draft).trim();
    if (!text || busy) return;

    const id = await ensureConversation();
    // History excludes the current question (the worker receives it as user_question).
    const history = messages
      .filter((message) => !message.pending && !message.error)
      .slice(-8)
      .map((message) => ({ role: message.role, content: message.content }));

    const userMessage = await appendMessage(id, 'user', text);
    messages = [...messages, userMessage];
    draft = '';
    lastQuestion = text;
    busy = true;
    messages = [
      ...messages,
      {
        id: `pending-${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ];

    try {
      const answer = await askAssistant(text, {
        history,
        language: get(locale) === 'zh-CN' ? 'zh' : 'en',
      });
      messages = messages.filter((message) => !message.pending);
      const assistantMessage = await appendMessage(id, 'assistant', answer);
      messages = [...messages, assistantMessage];
    } catch (error) {
      messages = messages.filter((message) => !message.pending);
      const code = (error as { code?: string })?.code;
      messages = [
        ...messages,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            code === 'origin'
              ? get(t)('assistant.errorOrigin')
              : get(t)('assistant.errorUnavailable'),
          createdAt: new Date().toISOString(),
          error: true,
        },
      ];
    } finally {
      busy = false;
      recent = await listConversations(10);
    }
  }

  function retry(): void {
    if (!lastQuestion || busy) return;
    void sendMessage(lastQuestion);
  }

  function onInput(event: Event): void {
    draft = (event.currentTarget as HTMLInputElement).value;
  }

  async function openConversation(conversation: Conversation): Promise<void> {
    conversationId = conversation.id;
    messages = conversation.messages.map((message) => ({ ...message }));
  }

  async function startNewConversation(): Promise<void> {
    conversationId = null;
    messages = [];
    recent = await listConversations(10);
  }

  function formatTime(iso: string): string {
    const date = new Date(iso);
    const localeTag = get(locale) === 'zh-CN' ? 'zh-CN' : 'en-US';
    return date.toLocaleString(localeTag, {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<section class="page assistant">
  <header class="hero">
    <span class="sparkle"><Icon name="assistant" size={38} strokeWidth={1.4} /></span>
    <div class="hero-text">
      <h2 class="title">{$t('assistant.title')}</h2>
      <p class="subtitle">{$t('assistant.subtitle1')}</p>
      <p class="subtitle">{$t('assistant.subtitle2')}</p>
    </div>
  </header>

  {#if messages.length > 0}
    <div class="thread" aria-label={$t('assistant.conversation')}>
      {#each messages as message (message.id)}
        <div class="bubble bubble-{message.role}" class:error={message.error}>
          {#if message.role === 'assistant' && !message.pending}
            <span class="role-label">{$t('assistant.aiLabel')}</span>
          {/if}
          {#if message.pending}
            <p class="thinking">{$t('assistant.thinking')}</p>
          {:else}
            <p>{message.content}</p>
            {#if message.error}
              <button class="retry" onclick={retry}>{$t('assistant.retry')}</button>
            {/if}
          {/if}
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
      disabled={busy}
      oninput={onInput}
      onkeydown={(event) => {
        if (event.key === 'Enter') sendMessage();
      }}
    />
    <Button
      variant="icon"
      ariaLabel={$t('assistant.send')}
      disabled={busy}
      onclick={() => sendMessage()}
    >
      <Icon name="send" size={20} />
    </Button>
  </div>

  <section class="block">
    <div class="block-head">
      <h3 class="block-title">{$t('assistant.recentConversations')}</h3>
      <button class="link" onclick={startNewConversation}>
        {$t('assistant.newConversation')}
      </button>
    </div>
    {#if recent.length > 0}
      <div class="conversations">
        {#each recent as conversation (conversation.id)}
          <button
            class="conversation"
            class:active={conversation.id === conversationId}
            onclick={() => openConversation(conversation)}
          >
            <span class="conv-title">
              {conversation.title || $t('assistant.newConversation')}
            </span>
            <span class="conv-summary">
              {conversation.messages[conversation.messages.length - 1]?.content.slice(0, 48) ??
                ''}
            </span>
            <span class="conv-time">{formatTime(conversation.updatedAt)}</span>
          </button>
        {/each}
      </div>
    {:else}
      <p class="note">{$t('assistant.emptyConversations')}</p>
    {/if}
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

  <p class="note note-center">{$t('assistant.advisoryNote')}</p>
  <p class="note note-center">{$t('assistant.privacyNote')}</p>
</section>

<style>
  .assistant {
    align-items: stretch;
  }
  .hero {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 14px;
  }
  .sparkle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--color-brand-soft);
    color: var(--color-brand);
  }
  .hero-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
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
  .bubble.error {
    background: var(--color-danger-bg);
    color: var(--color-danger);
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
  .thinking {
    color: var(--color-faint);
    font-style: italic;
  }
  .retry {
    display: block;
    margin-top: 8px;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-danger);
    font-size: 13px;
    font-weight: var(--font-weight-semibold);
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
  .composer-input:disabled {
    opacity: 0.6;
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
  .composer :global(.btn-icon:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .block-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .link {
    border: none;
    background: none;
    color: var(--color-brand);
    font-size: 12px;
    font-weight: var(--font-weight-semibold);
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
  .conversation.active {
    outline: 2px solid var(--color-brand);
  }
  .conv-title {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
  .conv-summary {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
