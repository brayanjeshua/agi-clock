#!/usr/bin/env node
/**
 * AGI Clock — Daily Collector
 * Fetches best scores per benchmark from llm-stats API,
 * calculates the composite AGI Index, and writes src/data/live.json.
 *
 * Required env:
 *   LLM_STATS_API_KEY  — Bearer token from https://llm-stats.com/developer
 *
 * Usage:
 *   node scripts/collect.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/live.json');
const HISTORY_FILE = path.join(ROOT, 'src/data/history.json');

const API_BASE = 'https://api.llm-stats.com/stats/v1';
const API_KEY = process.env.LLM_STATS_API_KEY;

if (!API_KEY) {
  console.error('❌ LLM_STATS_API_KEY env var is required.');
  console.error('   Get your key at https://llm-stats.com/developer');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Benchmark config ───────────────────────────────────────────────────────
// llm-stats benchmark slug → our config
const BENCHMARKS = [
  {
    id: 'arc-agi-v2',
    llmStatsSlug: 'arc-agi-2',
    name: 'ARC-AGI v2',
    category: 'Reasoning',
    humanExpertScore: 85.0,
    weight: 1.5,
    description:
      'General fluid intelligence via abstract pattern tasks. Closest proxy to true general reasoning.',
  },
  {
    id: 'swe-bench',
    llmStatsSlug: 'swe-bench-verified',
    name: 'SWE-Bench',
    category: 'Engineering',
    humanExpertScore: 92.0,
    weight: 1.5,
    description:
      'Real-world GitHub bug fixes requiring full codebase understanding and autonomous execution.',
  },
  {
    id: 'frontier-math',
    llmStatsSlug: 'frontier-math',
    name: 'FrontierMath',
    category: 'Mathematics',
    humanExpertScore: 5.0,
    weight: 1.0,
    description:
      'Expert-crafted mathematical problems beyond current textbooks. AI already exceeds expert humans.',
  },
  {
    id: 'gpqa-diamond',
    llmStatsSlug: 'gpqa-diamond',
    name: 'GPQA Diamond',
    category: 'Science',
    humanExpertScore: 69.3,
    weight: 1.0,
    description:
      'PhD-level questions in biology, chemistry, and physics written and validated by domain experts.',
  },
  {
    id: 'mmlu-pro',
    llmStatsSlug: 'mmlu-pro',
    name: 'MMLU-Pro',
    category: 'Knowledge',
    humanExpertScore: 85.0,
    weight: 0.75,
    description:
      'Professional-level knowledge across 57 academic domains. Harder variant of original MMLU.',
  },
  {
    id: 'livecodebench',
    llmStatsSlug: 'livecodebench',
    name: 'LiveCodeBench',
    category: 'Coding',
    humanExpertScore: 78.0,
    weight: 1.25,
    description:
      'Competitive programming problems from Codeforces, LeetCode, AtCoder — contamination-free.',
  },
];

// ─── API helpers ─────────────────────────────────────────────────────────────

async function apiFetch(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`llm-stats API error ${res.status} on ${path}: ${text}`);
  }
  return res.json();
}

/** Returns the best (max) score for a given benchmark slug, or null if not found. */
async function getBestScore(benchmarkSlug) {
  try {
    // GET /v1/scores?benchmark_id=<slug>&limit=100
    const data = await apiFetch(`/v1/scores?benchmark_id=${encodeURIComponent(benchmarkSlug)}&limit=100`);
    const scores = data?.scores ?? data?.data ?? [];
    if (!scores.length) return null;

    const values = scores
      .map((s) => {
        const v = s.score ?? s.value ?? s.result;
        return typeof v === 'number' ? v : parseFloat(v);
      })
      .filter((v) => !isNaN(v) && v > 0);

    return values.length ? Math.max(...values) : null;
  } catch (err) {
    console.warn(`  ⚠ Could not fetch ${benchmarkSlug}: ${err.message}`);
    return null;
  }
}

// ─── Composite index calculation ─────────────────────────────────────────────

function calcIndex(benchmarks) {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const b of benchmarks) {
    if (b.aiScore === null) continue;
    const progress = Math.min((b.aiScore / b.humanExpertScore) * 100, 100);
    weightedSum += progress * b.weight;
    totalWeight += b.weight;
  }
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null;
}

function calcTrend(id, aiScore, prevBenchmarks) {
  if (!prevBenchmarks) return 'fast';
  const prev = prevBenchmarks.find((b) => b.id === id);
  if (!prev || prev.aiScore === null) return 'fast';
  const delta = aiScore - prev.aiScore;
  if (aiScore >= prev.humanExpertScore || (aiScore / prev.humanExpertScore) * 100 >= 100) return 'exceeded';
  if (delta >= 3) return 'fast';
  if (delta >= 0.5) return 'slow';
  return 'slow';
}

// ─── ETA estimation (linear extrapolation) ──────────────────────────────────

function estimateETA(history) {
  if (history.length < 2) return { year: null, marginMonths: null };

  // Use last 4 data points for extrapolation
  const recent = history.slice(-4);
  const n = recent.length;

  // Simple linear regression: y = a + b*x where x = index (0..n-1)
  const xs = recent.map((_, i) => i);
  const ys = recent.map((h) => h.index);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const b =
    xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0) /
    xs.reduce((acc, x) => acc + Math.pow(x - xMean, 2), 0);
  const a = yMean - b * xMean;

  // Each data point is ~6 months apart historically
  const pointsNeeded = (100 - (a + b * (n - 1))) / b;
  const monthsFromNow = Math.round(pointsNeeded * 6);

  if (monthsFromNow <= 0 || monthsFromNow > 120) return { year: null, marginMonths: null };

  const now = new Date();
  const etaDate = new Date(now);
  etaDate.setMonth(etaDate.getMonth() + monthsFromNow);
  const marginMonths = Math.round(monthsFromNow * 0.35); // ±35% confidence

  return {
    year: etaDate.getFullYear(),
    marginMonths,
    monthsFromNow,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 AGI Clock Collector — starting...\n');
  const now = new Date().toISOString();
  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Load previous live data for trend calculation
  let prevBenchmarks = null;
  let history = [];
  try {
    const prev = JSON.parse(await fs.readFile(OUT, 'utf8'));
    prevBenchmarks = prev.benchmarks;
    history = prev.history ?? [];
  } catch {
    // First run
  }

  // Also merge from history.json if exists
  try {
    const h = JSON.parse(await fs.readFile(HISTORY_FILE, 'utf8'));
    if (Array.isArray(h) && history.length === 0) history = h;
  } catch {}

  // Fetch scores in parallel
  const results = await Promise.all(
    BENCHMARKS.map(async (b) => {
      process.stdout.write(`  ⏳ ${b.name} (${b.llmStatsSlug})...`);
      const score = await getBestScore(b.llmStatsSlug);
      const display = score !== null ? `${score.toFixed(1)}%` : 'N/A';
      process.stdout.write(` ${display}\n`);
      return { ...b, aiScore: score };
    })
  );

  // For any benchmark where the API returned null, fall back to previous value
  const benchmarks = results.map((b) => {
    if (b.aiScore === null && prevBenchmarks) {
      const prev = prevBenchmarks.find((p) => p.id === b.id);
      if (prev?.aiScore) {
        console.log(`  ↩ ${b.name}: using previous value ${prev.aiScore}%`);
        return { ...b, aiScore: prev.aiScore };
      }
    }
    return b;
  });

  // Calculate progress and trend for each
  const enriched = benchmarks.map((b) => {
    const progress =
      b.aiScore !== null
        ? Math.round((Math.min((b.aiScore / b.humanExpertScore) * 100, 100)) * 10) / 10
        : null;
    const trend =
      b.aiScore !== null
        ? progress >= 100
          ? 'exceeded'
          : calcTrend(b.id, b.aiScore, prevBenchmarks)
        : 'slow';
    return { ...b, progress, trend };
  });

  // Composite AGI index
  const agiIndex = calcIndex(enriched);
  console.log(`\n  ✅ Composite AGI Index: ${agiIndex}%`);

  // Append to history
  const lastEntry = history[history.length - 1];
  const shouldAppend = !lastEntry || lastEntry.date !== dateLabel;
  if (shouldAppend && agiIndex !== null) {
    history.push({ date: dateLabel, index: agiIndex, updatedAt: now });
  } else if (!shouldAppend) {
    // Update the last entry if same month
    history[history.length - 1] = { date: dateLabel, index: agiIndex, updatedAt: now };
  }

  // ETA estimation
  const eta = estimateETA(history);
  console.log(`  🗓  ETA: ${eta.year ?? 'unknown'} ±${eta.marginMonths ?? '?'} months`);

  // Build output
  const output = {
    agiIndex,
    updatedAt: now,
    eta,
    benchmarks: enriched.map((b) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      aiScore: b.aiScore,
      humanExpertScore: b.humanExpertScore,
      progress: b.progress,
      trend: b.trend,
      weight: b.weight,
      description: b.description,
    })),
    history,
  };

  await fs.writeFile(OUT, JSON.stringify(output, null, 2));
  console.log(`\n  💾 Written to ${OUT}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
