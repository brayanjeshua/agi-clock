export interface Benchmark {
  id: string;
  name: string;
  category: string;
  aiScore: number;
  humanExpertScore: number;
  progress: number;
  trend: 'fast' | 'slow' | 'exceeded';
  weight: number;
  description: string;
}

export const benchmarks: Benchmark[] = [
  {
    id: 'arc-agi-v2',
    name: 'ARC-AGI v2',
    category: 'Reasoning',
    aiScore: 77.1,
    humanExpertScore: 85.0,
    progress: 90.7,
    trend: 'fast',
    weight: 1.5,
    description: 'General fluid intelligence via abstract pattern tasks. Closest proxy to true general reasoning.',
  },
  {
    id: 'swe-bench',
    name: 'SWE-Bench',
    category: 'Engineering',
    aiScore: 71.3,
    humanExpertScore: 92.0,
    progress: 77.5,
    trend: 'fast',
    weight: 1.5,
    description: 'Real-world GitHub bug fixes requiring full codebase understanding and autonomous execution.',
  },
  {
    id: 'frontier-math',
    name: 'FrontierMath',
    category: 'Mathematics',
    aiScore: 23.8,
    humanExpertScore: 5.0,
    progress: 100,
    trend: 'exceeded',
    weight: 1.0,
    description: 'Expert-crafted mathematical problems beyond current textbooks. AI already exceeds expert humans.',
  },
  {
    id: 'gpqa-diamond',
    name: 'GPQA Diamond',
    category: 'Science',
    aiScore: 79.6,
    humanExpertScore: 69.3,
    progress: 100,
    trend: 'exceeded',
    weight: 1.0,
    description: 'PhD-level questions in biology, chemistry, and physics written and validated by domain experts.',
  },
  {
    id: 'mmlu-pro',
    name: 'MMLU-Pro',
    category: 'Knowledge',
    aiScore: 80.4,
    humanExpertScore: 85.0,
    progress: 94.6,
    trend: 'slow',
    weight: 0.75,
    description: 'Professional-level knowledge across 57 academic domains. Harder variant of original MMLU.',
  },
  {
    id: 'livecodebench',
    name: 'LiveCodeBench',
    category: 'Coding',
    aiScore: 64.2,
    humanExpertScore: 78.0,
    progress: 82.3,
    trend: 'fast',
    weight: 1.25,
    description: 'Competitive programming problems from Codeforces, LeetCode, AtCoder — contamination-free.',
  },
];

export const AGI_INDEX = 84.2;

export const historicalData = [
  { date: 'Jan 2023', value: 31 },
  { date: 'Jun 2023', value: 38 },
  { date: 'Jan 2024', value: 51 },
  { date: 'Jun 2024', value: 62 },
  { date: 'Jan 2025', value: 71 },
  { date: 'Jun 2025', value: 78 },
  { date: 'Jan 2026', value: 82 },
  { date: 'Jun 2026', value: 84.2 },
];

export const projectedData = [
  { date: 'Jun 2026', value: 84.2 },
  { date: 'Jan 2027', value: 89 },
  { date: 'Jun 2027', value: 93 },
  { date: 'Jan 2028', value: 97 },
  { date: 'Jun 2028', value: 100 },
];
