import liveData from './live.json';

export type Benchmark = (typeof liveData.benchmarks)[number];
export type Dimension = (typeof liveData.dimensions)[number];

export const benchmarks = liveData.benchmarks;
export const dimensions = liveData.dimensions;
export const AGI_READINESS = liveData.agiReadiness;
export const AGI_DISTANCE = liveData.agiDistance;

// Backward-compatible aliases for older imports.
export const AGI_INDEX = liveData.agiReadiness;
export const historicalData = liveData.history.map((point) => ({
  date: point.date,
  value: point.agiReadiness,
}));
export const projectedData: Array<{ date: string; value: number }> = [];
