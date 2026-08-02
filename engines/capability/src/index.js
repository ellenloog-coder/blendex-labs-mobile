/**
 * Blendex Labs Capability Engine (Phase 1.1).
 *
 * Framework-agnostic ES module extracted verbatim from the existing CPK tool
 * (ellenloog-coder/process-capability-analysis-tool, index.html inline script).
 * Pure functions only: no DOM, no report HTML, no chart rendering.
 *
 * Extraction boundary (per CPK Integration Plan v1):
 * - Included: parsing, statistics, capability indices, PPM, normality,
 *   histogram bins, validation, status, plain-text interpretation sentences,
 *   and display rounding helpers (decimals parameterized, default 3).
 * - Excluded: report HTML/text generation, SVG/chart helpers, DOM, upload.
 */

/* --- Parsing (pure) --- */

export function parseMeasurementData(raw) {
  const tokens = String(raw || '').split(/[\s,;|]+/).map((x) => x.trim()).filter(Boolean);
  const valid = [];
  const rawRows = [];
  let ignored = 0;
  tokens.forEach((token) => {
    const cleaned = token.replace(/^["']|["']$/g, '');
    const value = Number(cleaned);
    if (Number.isFinite(value)) {
      valid.push(value);
      rawRows.push({ measurement: value });
    } else ignored += 1;
  });
  return { valid, ignored, tokens: tokens.length, rawRows };
}

export function cleanDataToken(value) {
  return String(value || '').trim().replace(/^["']|["']$/g, '');
}

export function splitDelimitedLine(line) {
  return String(line || '').split(/[,\t;|]+/).map(cleanDataToken);
}

export function createSubgroupParseResult(subgroups, ignored, tokens, rawRows = []) {
  const valid = subgroups.flatMap((group) => group.values);
  const sizes = subgroups.map((group) => group.values.length);
  const count = subgroups.length;
  const averageSize = count ? sizes.reduce((sum, size) => sum + size, 0) / count : 0;
  return {
    valid,
    ignored,
    tokens,
    rawRows,
    subgroups,
    subgroup: {
      provided: true,
      count,
      averageSize,
      minSize: count ? Math.min(...sizes) : 0,
      maxSize: count ? Math.max(...sizes) : 0,
    },
  };
}

export function parseSubgroupValueTable(lines) {
  const groups = new Map();
  const rawRows = [];
  let ignored = 0;
  let tokens = 0;
  lines.slice(1).forEach((line) => {
    const cells = splitDelimitedLine(line).filter((cell) => cell !== '');
    if (cells.length < 2) {
      ignored += cells.length;
      tokens += cells.length;
      return;
    }
    const subgroupId = cells[0];
    const value = Number(cells[1]);
    tokens += 2;
    if (!subgroupId || !Number.isFinite(value)) {
      ignored += 1;
      return;
    }
    if (!groups.has(subgroupId)) groups.set(subgroupId, []);
    groups.get(subgroupId).push(value);
    rawRows.push({ subgroup: subgroupId, measurement: value });
  });
  const subgroups = Array.from(groups, ([id, values]) => ({ id, values }));
  return createSubgroupParseResult(subgroups, ignored, tokens, rawRows);
}

export function parseSubgroupMatrix(lines) {
  let ignored = 0;
  let tokens = 0;
  const subgroups = [];
  const rawRows = [];
  lines.forEach((line, index) => {
    const cells = splitDelimitedLine(line).filter((cell) => cell !== '');
    const values = [];
    tokens += cells.length;
    cells.forEach((cell) => {
      const value = Number(cell);
      if (Number.isFinite(value)) {
        values.push(value);
        rawRows.push({ subgroup: String(index + 1), measurement: value });
      } else ignored += 1;
    });
    if (values.length) subgroups.push({ id: String(index + 1), values });
  });
  return createSubgroupParseResult(subgroups, ignored, tokens, rawRows);
}

export function parseSubgroupData(raw) {
  const lines = String(raw || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return createSubgroupParseResult([], 0, 0);
  const firstLine = splitDelimitedLine(lines[0]).map((cell) => cell.toLowerCase());
  const isSubgroupValueTable =
    firstLine.length >= 2 &&
    firstLine[0] === 'subgroup' &&
    ['value', 'measurement', 'measurements'].includes(firstLine[1]);
  return isSubgroupValueTable ? parseSubgroupValueTable(lines) : parseSubgroupMatrix(lines);
}

export function parseInputData(raw, mode) {
  if (mode === 'subgroup') return parseSubgroupData(raw);
  const parsed = parseMeasurementData(raw);
  return {
    ...parsed,
    subgroups: [],
    subgroup: { provided: false, count: 0, averageSize: 0, minSize: 0, maxSize: 0 },
  };
}

/* --- Statistics --- */

export function calculateMean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateSampleStandardDeviation(values, average) {
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1));
}

export function calculatePooledWithinStandardDeviation(subgroups) {
  const validGroups = (subgroups || []).filter(
    (group) => Array.isArray(group.values) && group.values.length >= 2,
  );
  const totalDegreesOfFreedom = validGroups.reduce((sum, group) => sum + group.values.length - 1, 0);
  if (totalDegreesOfFreedom <= 0) return NaN;
  const pooledSumOfSquares = validGroups.reduce((sum, group) => {
    const average = calculateMean(group.values);
    return sum + group.values.reduce((groupSum, value) => groupSum + (value - average) ** 2, 0);
  }, 0);
  return Math.sqrt(pooledSumOfSquares / totalDegreesOfFreedom);
}

export function buildSubgroupInfo(subgroups) {
  const groups = Array.isArray(subgroups) ? subgroups : [];
  const sizes = groups.map((group) => group.values.length);
  const count = groups.length;
  return {
    provided: count > 0,
    count,
    averageSize: count ? sizes.reduce((sum, size) => sum + size, 0) / count : 0,
    minSize: count ? Math.min(...sizes) : 0,
    maxSize: count ? Math.max(...sizes) : 0,
  };
}

export function normalCdf(x) {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const erf =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  return 0.5 * (1 + sign * erf);
}

export function calculateEstimatedPpm({ mean, standardDeviation, lsl, usl }) {
  if (!Number.isFinite(mean) || !Number.isFinite(standardDeviation) || standardDeviation <= 0) {
    return { below: NaN, above: NaN, total: NaN };
  }
  const below = Number.isFinite(lsl) ? normalCdf((lsl - mean) / standardDeviation) * 1000000 : 0;
  const above = Number.isFinite(usl) ? (1 - normalCdf((usl - mean) / standardDeviation)) * 1000000 : 0;
  return {
    below: Math.max(0, below),
    above: Math.max(0, above),
    total: Math.max(0, below) + Math.max(0, above),
  };
}

/* --- Normality --- */

export function andersonDarlingPValue(adjustedStatistic) {
  const a = adjustedStatistic;
  if (!Number.isFinite(a)) return NaN;
  let p;
  if (a < 0.2) p = 1 - Math.exp(-13.436 + 101.14 * a - 223.73 * a * a);
  else if (a < 0.34) p = 1 - Math.exp(-8.318 + 42.796 * a - 59.938 * a * a);
  else if (a < 0.6) p = Math.exp(0.9177 - 4.279 * a - 1.38 * a * a);
  else p = Math.exp(1.2937 - 5.709 * a + 0.0186 * a * a);
  return Math.max(0, Math.min(1, p));
}

export function normalityInterpretation(pValue, language = 'en') {
  if (!Number.isFinite(pValue)) {
    return language === 'zh'
      ? { status: '不可用', cls: 'status-warn', text: '当前样本无法计算正态性评估。' }
      : { status: 'Not Available', cls: 'status-warn', text: 'Normality assessment could not be calculated for the current sample.' };
  }
  if (pValue < 0.05) {
    return language === 'zh'
      ? { status: '正态性假设可能不适用', cls: 'status-warn', text: '当前样本提供证据表明，正态性假设可能不适用于本次能力分析。' }
      : { status: 'Evidence Against Normality Assumption', cls: 'status-warn', text: 'The current sample provides evidence that the normality assumption may not be appropriate for this capability analysis.' };
  }
  if (pValue < 0.1) {
    return language === 'zh'
      ? { status: '边界结果', cls: 'status-warn', text: '正态性检验结果处于边界区域。基于当前样本，对正态性假设的判断应保持谨慎。' }
      : { status: 'Borderline', cls: 'status-warn', text: 'The normality test result is borderline. Based on the current sample, the normality assumption should be treated with caution.' };
  }
  return language === 'zh'
    ? { status: '未发现拒绝证据', cls: 'status-ok', text: '基于当前样本，未发现拒绝正态性假设的证据。' }
    : { status: 'No Evidence to Reject', cls: 'status-ok', text: 'No evidence was found to reject the normality assumption based on the current sample.' };
}

export function calculateNormalityAssessment(values) {
  const data = values.filter(Number.isFinite);
  if (data.length < 2) return { statistic: NaN, pValue: NaN, interpretation: normalityInterpretation(NaN) };
  const average = calculateMean(data);
  const sd = calculateSampleStandardDeviation(data, average);
  if (!Number.isFinite(sd) || sd === 0) return { statistic: NaN, pValue: NaN, interpretation: normalityInterpretation(NaN) };
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const epsilon = 1e-15;
  const sum = sorted.reduce((total, value, index) => {
    const lower = Math.min(1 - epsilon, Math.max(epsilon, normalCdf((value - average) / sd)));
    const upper = Math.min(1 - epsilon, Math.max(epsilon, normalCdf((sorted[n - 1 - index] - average) / sd)));
    return total + (2 * (index + 1) - 1) * (Math.log(lower) + Math.log(1 - upper));
  }, 0);
  const rawStatistic = -n - sum / n;
  const statistic = rawStatistic * (1 + 0.75 / n + 2.25 / (n * n));
  const pValue = andersonDarlingPValue(statistic);
  return {
    statistic,
    pValue,
    interpretation: normalityInterpretation(pValue),
  };
}

/* --- Histogram bins (data only) --- */

export function suggestHistogramBinCount(sampleSize) {
  if (!Number.isFinite(sampleSize) || sampleSize <= 0) return 0;
  if (sampleSize <= 30) return Math.max(6, Math.min(8, Math.ceil(Math.sqrt(sampleSize) * 1.25)));
  return Math.min(14, Math.max(8, Math.ceil(Math.sqrt(sampleSize) * 1.2)));
}

export function getObservedDomain(data) {
  const values = data.filter(Number.isFinite);
  if (!values.length) return null;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.05, 0.5);
    min -= pad;
    max += pad;
  }
  return { min, max };
}

export function getHistogramDomain(data, markerValues) {
  const observed = getObservedDomain(data);
  if (!observed) return null;
  const span = observed.max - observed.min;
  const pad = span * 0.12;
  let min = observed.min - pad;
  let max = observed.max + pad;
  Object.values(markerValues || {})
    .filter(Number.isFinite)
    .forEach((value) => {
      const closeLow = value < observed.min && observed.min - value <= span;
      const closeHigh = value > observed.max && value - observed.max <= span;
      if (closeLow) min = Math.min(min, value - pad);
      if (closeHigh) max = Math.max(max, value + pad);
      if (value >= observed.min && value <= observed.max) {
        min = Math.min(min, value - pad);
        max = Math.max(max, value + pad);
      }
    });
  return { min, max, observedMin: observed.min, observedMax: observed.max };
}

export function buildHistogramBins(data, markerValues) {
  const values = data.filter(Number.isFinite);
  const observed = getObservedDomain(values);
  const domain = getHistogramDomain(values, markerValues);
  const binCount = suggestHistogramBinCount(values.length);
  if (!observed || !domain || !binCount) return { bins: [], domain, maxCount: 0 };
  const width = (observed.max - observed.min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    start: observed.min + index * width,
    end: observed.min + (index + 1) * width,
    count: 0,
  }));
  values.forEach((value) => {
    const rawIndex = value === observed.max ? binCount - 1 : Math.floor((value - observed.min) / width);
    const index = Math.min(binCount - 1, Math.max(0, rawIndex));
    bins[index].count += 1;
  });
  return { bins, domain, maxCount: Math.max(...bins.map((bin) => bin.count), 0) };
}

/* --- Core capability stats --- */

export function calculateCapabilityStats({ data, lsl, usl, target, benchmark, item, owner, ignored, subgroups = [] }) {
  const avg = calculateMean(data);
  const subgroupInfo = buildSubgroupInfo(subgroups);
  const overall = calculateSampleStandardDeviation(data, avg);
  const within = subgroupInfo.provided ? calculatePooledWithinStandardDeviation(subgroups) : overall;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const cp = (usl - lsl) / (6 * within);
  const cpk = Math.min((usl - avg) / (3 * within), (avg - lsl) / (3 * within));
  const pp = (usl - lsl) / (6 * overall);
  const ppk = Math.min((usl - avg) / (3 * overall), (avg - lsl) / (3 * overall));
  const oos = data.filter((value) => value < lsl || value > usl).length;
  const estimatedPpm = calculateEstimatedPpm({ mean: avg, standardDeviation: overall, lsl, usl });
  return {
    item,
    owner,
    ignored,
    target,
    date: new Date().toLocaleDateString(),
    n: data.length,
    lsl,
    usl,
    bm: benchmark,
    avg,
    within,
    overall,
    min,
    max,
    cp,
    cpk,
    pp,
    ppk,
    oos,
    subgroup: subgroupInfo,
    estimatedPpm,
    normality: calculateNormalityAssessment(data),
    histogram: buildHistogramBins(data, { lsl, usl, mean: avg }),
  };
}

/* --- Validation --- */

export function validateInputs({ data, lsl, usl, benchmark, standardDeviation, subgroupMode = false, subgroups = [] }) {
  const errors = [];
  const warnings = [];
  if (data.length < 2) errors.push('Please enter at least two valid numeric values.');
  if (subgroupMode) {
    if (subgroups.length < 2) errors.push('Subgroup data requires at least two subgroups.');
    if (subgroups.some((group) => group.values.length < 2)) errors.push('Each subgroup must contain at least two observations.');
  }
  if (!Number.isFinite(lsl) || !Number.isFinite(usl)) errors.push('Please enter both LSL and USL.');
  else if (lsl >= usl) errors.push('LSL must be lower than USL.');
  if (!Number.isFinite(benchmark) || benchmark <= 0) errors.push('Please enter a capability requirement greater than 0.');
  if (data.length >= 2 && Number.isFinite(standardDeviation) && standardDeviation === 0)
    errors.push('Standard deviation is zero. Capability indices cannot be calculated.');
  if (data.length >= 2 && data.length < 30)
    warnings.push('Sample size is below 30. Interpret capability estimates with additional caution.');
  return { errors, warnings };
}

/* --- Status logic (unchanged) --- */

export function status(value, bm) {
  if (!Number.isFinite(value)) return { en: 'Not Available', zh: '不可用', cls: 'status-warn' };
  return value >= bm
    ? { en: 'Meets Requirement', zh: '达到能力要求', cls: 'status-ok' }
    : { en: 'Below Requirement', zh: '未满足能力要求', cls: 'status-warn' };
}

export function closeEnough(a, b) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= Math.max(0.000001, Math.abs(a) * 0.001);
}

export function hasCenteringEffect(spreadIndex, centeredIndex) {
  return Number.isFinite(spreadIndex) && Number.isFinite(centeredIndex) && spreadIndex > centeredIndex && !closeEnough(spreadIndex, centeredIndex);
}

/* --- Plain-text interpretation sentences (unchanged, bilingual) --- */

export function relationshipCpCpkEn(r) {
  if (hasCenteringEffect(r.cp, r.cpk)) {
    if (r.cp >= r.bm && r.cpk < r.bm)
      return 'Cp is greater than Cpk. Based on the current sample and the standard deviation method used in this version, the calculated Cp estimate meets the selected capability requirement, but sample location / centering reduces the calculated Cpk estimate below the selected capability requirement.';
    if (r.cp < r.bm && r.cpk < r.bm)
      return 'Cp is greater than Cpk. Sample location / centering reduces the calculated Cpk estimate. Cp is also below the selected capability requirement, so based on the current sample and the standard deviation method used in this version, the calculated Cp estimate does not meet the selected capability requirement.';
    return 'Cp is greater than Cpk. The difference indicates that sample location / centering reduces the calculated Cpk estimate.';
  }
  return 'Cp and Cpk are equal or very close for the current sample. The available index comparison does not indicate a meaningful centering reduction in this calculation.';
}

export function relationshipPpPpkEn(r) {
  if (hasCenteringEffect(r.pp, r.ppk)) {
    if (r.pp >= r.bm && r.ppk < r.bm)
      return 'Pp is greater than Ppk. Based on the current sample, the calculated Pp estimate meets the selected capability requirement, but sample location reduces the calculated Ppk estimate below the selected capability requirement.';
    if (r.pp < r.bm && r.ppk < r.bm)
      return 'Pp is greater than Ppk. Sample location reduces the calculated Ppk estimate. Pp is also below the selected capability requirement, so based on the current sample, the calculated Pp estimate does not meet the selected capability requirement.';
    return 'Pp is greater than Ppk. The difference indicates that sample location reduces the calculated Ppk estimate.';
  }
  return 'Pp and Ppk are equal or very close for the current sample. The available index comparison does not indicate a meaningful location reduction in this calculation.';
}

export function relationshipCpkPpkEn(r) {
  if (closeEnough(r.cpk, r.ppk) && !(r.subgroup && r.subgroup.provided))
    return 'In this version, Cp = Pp and Cpk = Ppk because the same sample standard deviation is used for both calculations. This should not be interpreted as a true comparison between within-process variation and overall variation.';
  if (closeEnough(r.cpk, r.ppk))
    return 'Cpk and Ppk are equal or very close for the current sample. The similarity reflects the calculated standard deviation estimates for this data set.';
  return 'Cpk and Ppk differ in this calculation. Review the standard deviation basis before interpreting the difference.';
}

export function relationshipCpCpkZh(r) {
  if (hasCenteringEffect(r.cp, r.cpk)) {
    if (r.cp >= r.bm && r.cpk < r.bm)
      return 'Cp 大于 Cpk。基于当前样本以及本版本使用的标准差方法，计算得到的 Cp 估计值达到所选能力要求，但样本位置/居中性使 Cpk 估计值降低到所选能力要求以下。';
    if (r.cp < r.bm && r.cpk < r.bm)
      return 'Cp 大于 Cpk，说明样本位置/居中性降低了 Cpk 估计值。同时 Cp 也低于所选能力要求，因此基于当前样本以及本版本使用的标准差方法，计算得到的 Cp 估计值未达到所选能力要求。';
    return 'Cp 大于 Cpk，说明样本位置/居中性降低了 Cpk 估计值。';
  }
  return '基于当前样本，Cp 与 Cpk 相等或非常接近。当前指数比较未显示出有意义的居中性降低影响。';
}

export function relationshipPpPpkZh(r) {
  if (hasCenteringEffect(r.pp, r.ppk)) {
    if (r.pp >= r.bm && r.ppk < r.bm)
      return 'Pp 大于 Ppk。基于当前样本，计算得到的 Pp 估计值达到所选能力要求，但样本位置使 Ppk 估计值降低到所选能力要求以下。';
    if (r.pp < r.bm && r.ppk < r.bm)
      return 'Pp 大于 Ppk，说明样本位置降低了 Ppk 估计值。同时 Pp 也低于所选能力要求，因此基于当前样本，计算得到的 Pp 估计值未达到所选能力要求。';
    return 'Pp 大于 Ppk，说明样本位置降低了 Ppk 估计值。';
  }
  return '基于当前样本，Pp 与 Ppk 相等或非常接近。当前指数比较未显示出有意义的位置降低影响。';
}

export function relationshipCpkPpkZh(r) {
  if (closeEnough(r.cpk, r.ppk) && !(r.subgroup && r.subgroup.provided))
    return '在本版本中，Cp = Pp 且 Cpk = Ppk，因为两类计算均使用同一个样本标准差。这不应被解释为已经完成真正的组内波动与总体波动比较。';
  if (closeEnough(r.cpk, r.ppk))
    return '基于当前样本，Cpk 与 Ppk 相等或非常接近。该相似性反映了当前数据集计算得到的标准差估计结果。';
  return '本次计算中 Cpk 与 Ppk 存在差异。解释差异前应先确认标准差估计方式。';
}

export function indexSentenceEn(name, value, bm) {
  const meets = value >= bm;
  const comp = meets ? 'meets or exceeds' : 'is below';
  const methodNote = name === 'Cp' || name === 'Cpk' ? ' and the standard deviation method used in this version' : '';
  return `${name} ${comp} the selected capability requirement. Based on the current sample${methodNote}, the calculated ${name} estimate ${meets ? 'meets' : 'does not meet'} the selected capability requirement.`;
}

export function indexSentenceZh(name, value, bm) {
  const meets = value >= bm;
  const methodNote = name === 'Cp' || name === 'Cpk' ? '以及本版本使用的标准差方法' : '';
  return `${name} ${meets ? '达到或高于' : '低于'}所选能力要求。基于当前样本${methodNote}，计算得到的 ${name} 估计值${meets ? '达到' : '未达到'}所选能力要求。`;
}

/* --- Display rounding helpers (decimals parameterized, default 3 = tool default) --- */

export function fmt(value, decimals = 3) {
  return Number.isFinite(value) ? Number(value).toFixed(decimals) : 'N/A';
}

export function fmtPValue(value, decimals = 3) {
  if (!Number.isFinite(value)) return 'N/A';
  const d = decimals;
  const threshold = 10 ** (-d);
  if (value > 0 && value < threshold) return `< ${threshold.toFixed(d)}`;
  return Number(value).toFixed(d);
}

export function fmtPpm(value) {
  if (!Number.isFinite(value)) return 'N/A';
  return Math.round(Math.max(0, value)).toLocaleString();
}

export function fmtPercentFromPpm(value) {
  if (!Number.isFinite(value)) return 'N/A';
  return `${(Math.max(0, value) / 10000).toFixed(2)}%`;
}
