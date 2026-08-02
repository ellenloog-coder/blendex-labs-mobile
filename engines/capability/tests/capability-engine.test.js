import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMeasurementData,
  parseInputData,
  calculateMean,
  calculateSampleStandardDeviation,
  calculatePooledWithinStandardDeviation,
  calculateCapabilityStats,
  calculateEstimatedPpm,
  validateInputs,
  status,
  relationshipCpCpkEn,
  relationshipCpkPpkEn,
  fmtPpm,
  fmtPercentFromPpm,
} from '../src/index.js';

function approx(actual, expected, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function sameArray(actual, expected) {
  assert.deepEqual(actual, expected);
}

/* --- Parsing (ported from tool tests) --- */

test('parses numeric measurement data and ignores non-numeric tokens', () => {
  const parsed = parseMeasurementData('10.1\nabc, 10.2; 10.3 | bad');
  sameArray(parsed.valid, [10.1, 10.2, 10.3]);
  assert.strictEqual(parsed.ignored, 2);
  assert.strictEqual(parsed.tokens, 5);
});

test('one-column input reports no subgroup structure', () => {
  const parsed = parseInputData('9.96\n9.98\n10.00\n10.02\n10.04', 'single');
  assert.strictEqual(parsed.subgroup.provided, false);
  sameArray(parsed.valid, [9.96, 9.98, 10, 10.02, 10.04]);
});

test('parses subgroup-value table format', () => {
  const parsed = parseInputData('Subgroup,Value\n1,9.98\n1,10.00\n2,10.08\n2,10.10', 'subgroup');
  sameArray(parsed.valid, [9.98, 10, 10.08, 10.1]);
  assert.strictEqual(parsed.subgroup.provided, true);
  assert.strictEqual(parsed.subgroup.count, 2);
  approx(parsed.subgroup.averageSize, 2);
  sameArray(parsed.subgroups.map((group) => group.values.length), [2, 2]);
});

test('parses matrix subgroup format', () => {
  const parsed = parseInputData('9.98,10.00,10.02\n10.08,10.10,10.12', 'subgroup');
  sameArray(parsed.valid, [9.98, 10, 10.02, 10.08, 10.1, 10.12]);
  assert.strictEqual(parsed.subgroup.provided, true);
  assert.strictEqual(parsed.subgroup.count, 2);
  approx(parsed.subgroup.averageSize, 3);
});

/* --- Validation (ported from tool tests) --- */

test('validates sample size, specification limits, requirement, and zero standard deviation', () => {
  let result = validateInputs({ data: [10], lsl: 10, usl: 9, benchmark: 0, standardDeviation: NaN });
  assert.ok(result.errors.includes('Please enter at least two valid numeric values.'));
  assert.ok(result.errors.includes('LSL must be lower than USL.'));
  assert.ok(result.errors.includes('Please enter a capability requirement greater than 0.'));

  result = validateInputs({ data: [10, 10], lsl: 9, usl: 11, benchmark: 1.33, standardDeviation: 0 });
  assert.ok(result.errors.includes('Standard deviation is zero. Capability indices cannot be calculated.'));

  result = validateInputs({ data: [10, 10.1], lsl: 9, usl: 11, benchmark: 1.33, standardDeviation: 0.071 });
  sameArray(result.errors, []);
  assert.ok(result.warnings.includes('Sample size is below 30. Interpret capability estimates with additional caution.'));
});

test('invalid subgroup data returns clear validation errors', () => {
  const parsed = parseInputData('Subgroup,Value\n1,10.01\n2,10.02', 'subgroup');
  const validation = validateInputs({
    data: parsed.valid,
    lsl: 9.9,
    usl: 10.1,
    benchmark: 1.33,
    standardDeviation: calculatePooledWithinStandardDeviation(parsed.subgroups),
    subgroupMode: true,
    subgroups: parsed.subgroups,
  });
  assert.ok(validation.errors.includes('Each subgroup must contain at least two observations.'));
});

test('subgroup validation requires at least two subgroups', () => {
  const parsed = parseInputData('10.01,10.02,10.03', 'subgroup');
  const validation = validateInputs({
    data: parsed.valid,
    lsl: 9.9,
    usl: 10.1,
    benchmark: 1.33,
    standardDeviation: calculatePooledWithinStandardDeviation(parsed.subgroups),
    subgroupMode: true,
    subgroups: parsed.subgroups,
  });
  assert.ok(validation.errors.includes('Subgroup data requires at least two subgroups.'));
});

/* --- Statistics (ported from tool tests) --- */

test('calculates mean and sample standard deviation', () => {
  const values = [1, 2, 3, 4, 5];
  const average = calculateMean(values);
  const sd = calculateSampleStandardDeviation(values, average);
  approx(average, 3);
  approx(sd, Math.sqrt(2.5));
});

test('calculates Cp, Cpk, Pp, and Ppk using sample standard deviation', () => {
  const data = [9.96, 9.98, 10, 10.02, 10.04];
  const stats = calculateCapabilityStats({
    data,
    lsl: 9.9,
    usl: 10.1,
    target: 10,
    benchmark: 1.33,
    item: 'Test Item',
    owner: 'Test Team',
    ignored: 0,
  });
  approx(stats.avg, 10);
  approx(stats.within, Math.sqrt(0.001));
  approx(stats.overall, stats.within);
  approx(stats.cp, (10.1 - 9.9) / (6 * stats.within));
  approx(stats.cpk, Math.min((10.1 - stats.avg) / (3 * stats.within), (stats.avg - 9.9) / (3 * stats.within)));
  approx(stats.pp, stats.cp);
  approx(stats.ppk, stats.cpk);
  assert.strictEqual(stats.oos, 0);
  assert.ok(stats.histogram.bins.length > 0);
});

test('one-column input uses the same standard deviation for within and overall', () => {
  const parsed = parseInputData('9.96\n9.98\n10.00\n10.02\n10.04', 'single');
  const stats = calculateCapabilityStats({
    data: parsed.valid,
    lsl: 9.9,
    usl: 10.1,
    target: 10,
    benchmark: 1.33,
    item: 'Test Item',
    owner: 'Test Team',
    ignored: parsed.ignored,
    subgroups: parsed.subgroups,
  });
  assert.strictEqual(stats.subgroup.provided, false);
  approx(stats.within, stats.overall);
  approx(stats.cp, stats.pp);
  approx(stats.cpk, stats.ppk);
});

test('subgroup capability uses pooled within standard deviation and overall sample standard deviation', () => {
  const groups = [[9.98, 10, 10.02], [10.08, 10.1, 10.12], [9.94, 9.96, 9.98]];
  const parsed = parseInputData(groups.map((g) => g.join(',')).join('\n'), 'subgroup');
  const stats = calculateCapabilityStats({
    data: parsed.valid,
    lsl: 9.9,
    usl: 10.1,
    target: 10,
    benchmark: 1.33,
    item: 'Test Item',
    owner: 'Test Team',
    ignored: parsed.ignored,
    subgroups: parsed.subgroups,
  });
  approx(stats.within, 0.02, 1e-12);
  assert.ok(stats.overall > stats.within);
  approx(stats.cp, (10.1 - 9.9) / (6 * stats.within));
  approx(stats.cpk, Math.min((10.1 - stats.avg) / (3 * stats.within), (stats.avg - 9.9) / (3 * stats.within)));
  approx(stats.pp, (10.1 - 9.9) / (6 * stats.overall));
  approx(stats.ppk, Math.min((10.1 - stats.avg) / (3 * stats.overall), (stats.avg - 9.9) / (3 * stats.overall)));
  assert.notStrictEqual(stats.cp, stats.pp);
  assert.notStrictEqual(stats.cpk, stats.ppk);
});

/* --- Exact parity with the original tool (captured from tool output) --- */

test('single-measurement output exactly matches the original tool', () => {
  const f1 = { data: [9.96, 9.98, 10, 10.02, 10.04], lsl: 9.9, usl: 10.1, target: 10, benchmark: 1.33, item: 'Test Item', owner: 'Test Team', ignored: 0 };
  const s = calculateCapabilityStats(f1);
  assert.strictEqual(s.avg, 10);
  assert.strictEqual(s.within, 0.03162277660168312);
  assert.strictEqual(s.overall, 0.03162277660168312);
  assert.strictEqual(s.cp, 1.0540925533894785);
  assert.strictEqual(s.cpk, 1.0540925533894785);
  assert.strictEqual(s.pp, 1.0540925533894785);
  assert.strictEqual(s.ppk, 1.0540925533894785);
  assert.strictEqual(s.oos, 0);
  assert.strictEqual(s.estimatedPpm.below, 782.7670338457771);
  assert.strictEqual(s.estimatedPpm.above, 782.7670338458325);
  assert.strictEqual(s.estimatedPpm.total, 1565.5340676916096);
  assert.strictEqual(s.histogram.bins.length, 6);
  assert.deepEqual(s.histogram.bins.map((b) => b.count), [1, 1, 0, 1, 1, 1]);
});

test('subgroup output exactly matches the original tool', () => {
  const groups = [[9.98, 10, 10.02], [10.08, 10.1, 10.12], [9.94, 9.96, 9.98]];
  const f2 = {
    data: groups.flat(),
    lsl: 9.9,
    usl: 10.1,
    target: 10,
    benchmark: 1.33,
    item: 'Test Item',
    owner: 'Test Team',
    ignored: 0,
    subgroups: groups.map((values, i) => ({ id: String(i + 1), values })),
  };
  const s = calculateCapabilityStats(f2);
  assert.strictEqual(s.avg, 10.02);
  assert.strictEqual(s.within, 0.019999999999999872);
  assert.strictEqual(s.overall, 0.06480740698407832);
  assert.strictEqual(s.cp, 1.6666666666666714);
  assert.strictEqual(s.cpk, 1.333333333333343);
  assert.strictEqual(s.pp, 0.5143444998736402);
  assert.strictEqual(s.ppk, 0.41147559989891397);
  assert.strictEqual(s.oos, 1);
  assert.strictEqual(s.estimatedPpm.total, 140560.71435462174);
  assert.strictEqual(s.subgroup.provided, true);
  assert.deepEqual(s.histogram.bins.map((b) => b.count), [2, 2, 2, 0, 1, 2]);
});

/* --- PPM (ported from tool tests) --- */

test('calculates two-sided estimated PPM from fitted normal distribution', () => {
  const ppm = calculateEstimatedPpm({ mean: 0, standardDeviation: 1, lsl: -3, usl: 3 });
  approx(ppm.below, 1349.967, 0.5);
  approx(ppm.above, 1349.967, 0.5);
  approx(ppm.total, 2699.934, 1);
  approx(ppm.total, ppm.below + ppm.above);
});

test('calculates one-sided estimated PPM when only one specification limit is finite', () => {
  const lowerOnly = calculateEstimatedPpm({ mean: 0, standardDeviation: 1, lsl: -2, usl: NaN });
  approx(lowerOnly.below, 22750.13, 2);
  approx(lowerOnly.above, 0);
  approx(lowerOnly.total, lowerOnly.below);

  const upperOnly = calculateEstimatedPpm({ mean: 0, standardDeviation: 1, lsl: NaN, usl: 2 });
  approx(upperOnly.below, 0);
  approx(upperOnly.above, 22750.13, 2);
  approx(upperOnly.total, upperOnly.above);
});

test('calculates high estimated PPM for poor capability', () => {
  const ppm = calculateEstimatedPpm({ mean: 0, standardDeviation: 1, lsl: -0.5, usl: 0.5 });
  assert.ok(ppm.total > 600000);
  approx(ppm.total, 617075, 200);
});

/* --- Formatting (ported from tool tests) --- */

test('formats estimated PPM and percentage', () => {
  const ppm = calculateEstimatedPpm({ mean: 0, standardDeviation: 0.1, lsl: -1, usl: 1 });
  assert.strictEqual(fmtPpm(ppm.total), '0');
  assert.strictEqual(fmtPercentFromPpm(ppm.total), '0.00%');
  assert.strictEqual(fmtPercentFromPpm(6081), '0.61%');
  assert.strictEqual(fmtPercentFromPpm(125000), '12.50%');
});

/* --- Status and interpretation (unchanged wording) --- */

test('status logic maps indices against the capability requirement', () => {
  assert.strictEqual(status(1.5, 1.33).en, 'Meets Requirement');
  assert.strictEqual(status(1.0, 1.33).en, 'Below Requirement');
  assert.strictEqual(status(NaN, 1.33).en, 'Not Available');
});

test('interpretation sentences preserve the tool wording', () => {
  const crafted = { cp: 1.5, cpk: 1.2, pp: 1.6, ppk: 1.25, bm: 1.33, subgroup: { provided: false } };
  const en = relationshipCpCpkEn(crafted);
  assert.ok(en.includes('Cp is greater than Cpk'));
  assert.ok(en.includes('sample location / centering reduces the calculated Cpk estimate'));

  const sameSd = { cpk: 1.05, ppk: 1.05, subgroup: { provided: false } };
  assert.ok(relationshipCpkPpkEn(sameSd).includes('Cp = Pp and Cpk = Ppk'));
});
