export interface ParsedMeasurementResult {
  valid: number[];
  ignored: number;
  tokens: number;
  rawRows: { measurement: number }[];
}

export interface Subgroup {
  id: string;
  values: number[];
}

export interface SubgroupInfo {
  provided: boolean;
  count: number;
  averageSize: number;
  minSize: number;
  maxSize: number;
}

export interface ParsedSubgroupResult {
  valid: number[];
  ignored: number;
  tokens: number;
  rawRows: { subgroup: string; measurement: number }[];
  subgroups: Subgroup[];
  subgroup: SubgroupInfo;
}

export type ParsedInputData = ParsedMeasurementResult & {
  subgroups: Subgroup[];
  subgroup: SubgroupInfo;
};

export interface PpmResult {
  below: number;
  above: number;
  total: number;
}

export interface NormalityInterpretation {
  status: string;
  cls: string;
  text: string;
}

export interface NormalityResult {
  statistic: number;
  pValue: number;
  interpretation: NormalityInterpretation;
}

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface HistogramResult {
  bins: HistogramBin[];
  domain: { min: number; max: number; observedMin: number; observedMax: number } | null;
  maxCount: number;
}

export interface CapabilityStats {
  item: string;
  owner: string;
  ignored: number;
  target: number;
  date: string;
  n: number;
  lsl: number;
  usl: number;
  bm: number;
  avg: number;
  within: number;
  overall: number;
  min: number;
  max: number;
  cp: number;
  cpk: number;
  pp: number;
  ppk: number;
  oos: number;
  subgroup: SubgroupInfo;
  estimatedPpm: PpmResult;
  normality: NormalityResult;
  histogram: HistogramResult;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export interface StatusResult {
  en: string;
  zh: string;
  cls: string;
}

export function parseMeasurementData(raw: string): ParsedMeasurementResult;
export function cleanDataToken(value: string): string;
export function splitDelimitedLine(line: string): string[];
export function createSubgroupParseResult(
  subgroups: Subgroup[],
  ignored: number,
  tokens: number,
  rawRows?: { subgroup: string; measurement: number }[],
): ParsedSubgroupResult;
export function parseSubgroupValueTable(lines: string[]): ParsedSubgroupResult;
export function parseSubgroupMatrix(lines: string[]): ParsedSubgroupResult;
export function parseSubgroupData(raw: string): ParsedSubgroupResult;
export function parseInputData(raw: string, mode: 'single' | 'subgroup'): ParsedInputData;

export function calculateMean(values: number[]): number;
export function calculateSampleStandardDeviation(values: number[], average: number): number;
export function calculatePooledWithinStandardDeviation(subgroups: Subgroup[]): number;
export function buildSubgroupInfo(subgroups: Subgroup[]): SubgroupInfo;
export function normalCdf(x: number): number;
export function calculateEstimatedPpm(options: {
  mean: number;
  standardDeviation: number;
  lsl: number;
  usl: number;
}): PpmResult;
export function andersonDarlingPValue(adjustedStatistic: number): number;
export function normalityInterpretation(
  pValue: number,
  language?: 'en' | 'zh',
): NormalityInterpretation;
export function calculateNormalityAssessment(values: number[]): NormalityResult;
export function suggestHistogramBinCount(sampleSize: number): number;
export function getObservedDomain(data: number[]): { min: number; max: number } | null;
export function getHistogramDomain(
  data: number[],
  markerValues?: Record<string, number>,
): { min: number; max: number; observedMin: number; observedMax: number } | null;
export function buildHistogramBins(
  data: number[],
  markerValues?: Record<string, number>,
): HistogramResult;
export function calculateCapabilityStats(options: {
  data: number[];
  lsl: number;
  usl: number;
  target?: number;
  benchmark: number;
  item?: string;
  owner?: string;
  ignored?: number;
  subgroups?: Subgroup[];
}): CapabilityStats;
export function validateInputs(options: {
  data: number[];
  lsl: number;
  usl: number;
  benchmark: number;
  standardDeviation: number;
  subgroupMode?: boolean;
  subgroups?: Subgroup[];
}): ValidationResult;
export function status(value: number, benchmark: number): StatusResult;
export function closeEnough(a: number, b: number): boolean;
export function hasCenteringEffect(spreadIndex: number, centeredIndex: number): boolean;
export function relationshipCpCpkEn(result: CapabilityStats): string;
export function relationshipPpPpkEn(result: CapabilityStats): string;
export function relationshipCpkPpkEn(result: CapabilityStats): string;
export function relationshipCpCpkZh(result: CapabilityStats): string;
export function relationshipPpPpkZh(result: CapabilityStats): string;
export function relationshipCpkPpkZh(result: CapabilityStats): string;
export function indexSentenceEn(name: string, value: number, benchmark: number): string;
export function indexSentenceZh(name: string, value: number, benchmark: number): string;
export function fmt(value: number, decimals?: number): string;
export function fmtPValue(value: number, decimals?: number): string;
export function fmtPpm(value: number): string;
export function fmtPercentFromPpm(value: number): string;
