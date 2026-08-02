<script lang="ts">
  import { fmt } from '../../../../../engines/capability/src/index.js';
  import { t } from '../../i18n';
  import type { CapabilityEvidence } from '../../tools/capability/adapter';

  let { evidence }: { evidence: CapabilityEvidence } = $props();
</script>

<div class="evidence">
  <div class="row"><span>{$t('cpk.sampleSize')}</span><span class="tabular">{evidence.sampleSize}</span></div>
  <div class="row"><span>{$t('cpk.mean')}</span><span class="tabular">{fmt(evidence.mean)}</span></div>
  <div class="row"><span>{$t('cpk.withinStd')}</span><span class="tabular">{fmt(evidence.withinStdDev)}</span></div>
  <div class="row"><span>{$t('cpk.overallStd')}</span><span class="tabular">{fmt(evidence.overallStdDev)}</span></div>
  <div class="row"><span>{$t('cpk.min')}</span><span class="tabular">{fmt(evidence.min)}</span></div>
  <div class="row"><span>{$t('cpk.max')}</span><span class="tabular">{fmt(evidence.max)}</span></div>
  <div class="row"><span>{$t('cpk.oos')}</span><span class="tabular">{evidence.oos}</span></div>
  <div class="row"><span>{$t('cpk.estPpm')}</span><span class="tabular">{fmt(evidence.estimatedPpm.total)}</span></div>
  <div class="row"><span>{$t('cpk.normality')}</span><span class="tabular">{fmt(evidence.normality.pValue)}</span></div>
</div>

<style>
  .evidence {
    margin-top: 10px;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 38px;
    border-bottom: 1px solid var(--color-hairline);
    font-size: 14px;
    color: var(--color-ink);
  }
  .row:last-child {
    border-bottom: none;
  }
  .row span:last-child {
    color: var(--color-secondary);
  }
</style>
