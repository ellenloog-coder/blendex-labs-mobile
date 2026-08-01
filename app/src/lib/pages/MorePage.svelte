<script lang="ts">
  import { get } from 'svelte/store';
  import Card from '../components/Card.svelte';
  import Chip from '../components/Chip.svelte';
  import ConfirmDialog from '../components/ConfirmDialog.svelte';
  import Icon from '../components/Icon.svelte';
  import { locale, setLocale, t } from '../i18n';
  import type { Locale } from '../i18n';
  import { navigate } from '../router';
  import { setSetting } from '../storage/settings';
  import { clearAllStores } from '../storage/db';
  import { showToast } from '../toast';
  import type { RouteParams } from '../router/routes';

  let { params = {} }: { params?: RouteParams } = $props();

  let confirmOpen = $state(false);
  let learnMoreSlug = $derived(
    $locale === 'en'
      ? '/knowledge/article/ai-transforming-quality-engineering-en'
      : '/knowledge/article/ai-transforming-quality-engineering',
  );

  async function chooseLocale(next: Locale): Promise<void> {
    setLocale(next);
    await setSetting('locale', next);
  }

  async function onClearConfirmed(): Promise<void> {
    confirmOpen = false;
    try {
      await clearAllStores();
      showToast(get(t)('more.cleared'), 'success');
    } catch (error) {
      console.warn('Failed to clear local data:', error);
      showToast(get(t)('common.retry'), 'danger');
    }
  }
</script>

<section class="page">
  <header>
    <h2 class="page-title">{$t('more.title')}</h2>
    <p class="page-desc">{$t('more.description')}</p>
  </header>

  <Card>
    <h3 class="section-label">{$t('more.preferences')}</h3>
    <div class="row">
      <span>{$t('more.language')}</span>
      <div class="lang-toggle">
        <Chip active={$locale === 'en'} onclick={() => chooseLocale('en')}>English</Chip>
        <Chip active={$locale === 'zh-CN'} onclick={() => chooseLocale('zh-CN')}>中文</Chip>
      </div>
    </div>
    <div class="row">
      <span>{$t('more.appearance')}</span>
      <span class="muted">{$t('more.lightMode')}</span>
    </div>
  </Card>

  <Card>
    <h3 class="section-label">{$t('more.dataPrivacy')}</h3>
    <div class="row">
      <span class="with-icon">
        <Icon name="lock" size={16} />
        {$t('more.localStorage')}
      </span>
      <span class="muted">{$t('more.localStorageDesc')}</span>
    </div>
    <button class="danger-row" onclick={() => (confirmOpen = true)}>
      {$t('more.clearData')}
    </button>
  </Card>

  <Card soft>
    <h3 class="section-label">{$t('more.aiPrivacy')}</h3>
    <p class="muted">{$t('more.aiPrivacyText')}</p>
    <button class="learn-more" onclick={() => navigate(learnMoreSlug)}>
      {$t('more.learnMore')}
    </button>
  </Card>

  <Card>
    <h3 class="section-label">{$t('more.support')}</h3>
    <div class="row"><span>{$t('more.help')}</span></div>
    <div class="row"><span>{$t('more.feedback')}</span></div>
    <div class="row"><span>{$t('more.reportProblem')}</span></div>
  </Card>

  <Card>
    <h3 class="section-label">{$t('more.about')}</h3>
    <div class="row">
      <span>{$t('app.name')}</span>
      <span class="muted">{$t('common.version')} {$t('more.versionPreview')}</span>
    </div>
  </Card>

  <ConfirmDialog
    open={confirmOpen}
    title={get(t)('more.clearTitle')}
    message={get(t)('more.clearConfirm')}
    onConfirm={onClearConfirmed}
    onCancel={() => (confirmOpen = false)}
  />
</section>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 56px;
    border-bottom: 1px solid var(--color-hairline);
    font-size: 14px;
    color: var(--color-ink);
  }
  .row:last-child {
    border-bottom: none;
  }
  .with-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .lang-toggle {
    display: flex;
    gap: 6px;
  }
  .danger-row {
    display: block;
    width: 100%;
    min-height: 48px;
    margin-top: 8px;
    border: none;
    background: none;
    text-align: left;
    font-size: 14px;
    color: var(--color-danger);
  }
  .learn-more {
    display: block;
    margin-top: 10px;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-brand);
    font-size: 13px;
    font-weight: var(--font-weight-semibold);
  }
</style>
