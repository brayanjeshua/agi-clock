#!/usr/bin/env node
/**
 * AGI Clock — Daily Collector
 *
 * Fetches frontier benchmark scores from LLM Stats and calculates a broader
 * AGI readiness proxy. This is not an AGI claim: it measures distance across
 * reasoning, engineering, agentic autonomy, and tool/search reliability.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/data/live.json');

const API_BASE = 'https://api.llm-stats.com';
const API_KEY = process.env.LLM_STATS_API_KEY;

const DIMENSIONS = [
  {
    id: 'reasoningKnowledge',
    name: 'Reasoning + Expert Knowledge',
    weight: 0.3,
    description: 'Abstract reasoning, expert knowledge, science, math, and frontier closed-ended questions.',
  },
  {
    id: 'codingEngineering',
    name: 'Coding + Engineering',
    weight: 0.25,
    description: 'Software engineering, competitive coding, terminal work, and multi-step code tasks.',
  },
  {
    id: 'agentsAutonomy',
    name: 'Agents + Autonomy',
    weight: 0.3,
    description: 'Computer use, long-horizon professional workflows, planning, and applied office/finance tasks.',
  },
  {
    id: 'toolSearchReliability',
    name: 'Tool Use + Search Reliability',
    weight: 0.15,
    description: 'Tool calling, web/search persistence, user-policy following, and repeated agent reliability proxies.',
  },
];

const BENCHMARKS = [
  {
    id: 'arc-agi-v2',
    llmStatsSlug: 'arc-agi-v2',
    name: 'ARC-AGI v2',
    category: 'Reasoning',
    dimension: 'reasoningKnowledge',
    description: 'Abstract grid transformation tasks for fluid reasoning and novel problem solving.',
  },
  {
    id: 'hle',
    llmStatsSlug: "humanity's-last-exam",
    name: "Humanity's Last Exam",
    category: 'Expert Knowledge',
    dimension: 'reasoningKnowledge',
    description: '2,500 expert-vetted multimodal questions across math, science, humanities, and vision.',
  },
  {
    id: 'gpqa',
    llmStatsSlug: 'gpqa',
    name: 'GPQA',
    category: 'Science',
    dimension: 'reasoningKnowledge',
    description: 'PhD-level questions in biology, chemistry, and physics.',
  },
  {
    id: 'mmlu-pro',
    llmStatsSlug: 'mmlu-pro',
    name: 'MMLU-Pro',
    category: 'Knowledge',
    dimension: 'reasoningKnowledge',
    description: 'Harder professional knowledge benchmark across academic and applied domains.',
  },
  {
    id: 'frontiermath',
    llmStatsSlug: 'frontiermath',
    name: 'FrontierMath',
    category: 'Mathematics',
    dimension: 'reasoningKnowledge',
    description: 'Advanced unpublished mathematical problems authored and reviewed by expert mathematicians.',
  },
  {
    id: 'swe-bench-verified',
    llmStatsSlug: 'swe-bench-verified',
    name: 'SWE-Bench Verified',
    category: 'Engineering',
    dimension: 'codingEngineering',
    description: 'Real GitHub issue resolution requiring codebase understanding and patching.',
  },
  {
    id: 'swe-bench-pro',
    llmStatsSlug: 'swe-bench-pro',
    name: 'SWE-Bench Pro',
    category: 'Engineering',
    dimension: 'codingEngineering',
    description: 'Complex real-world software engineering tasks with extended multi-step reasoning.',
  },
  {
    id: 'livecodebench-v6',
    llmStatsSlug: 'livecodebench-v6',
    name: 'LiveCodeBench v6',
    category: 'Coding',
    dimension: 'codingEngineering',
    description: 'Contamination-resistant competitive programming tasks collected over time.',
  },
  {
    id: 'terminal-bench',
    llmStatsSlug: 'terminal-bench',
    name: 'Terminal-Bench',
    category: 'Terminal Work',
    dimension: 'codingEngineering',
    description: 'End-to-end tasks in real terminal environments, including servers, data, and security workflows.',
  },
  {
    id: 'terminal-bench-2-1',
    llmStatsSlug: 'terminal-bench-2.1',
    name: 'Terminal-Bench 2.1',
    category: 'Terminal Work',
    dimension: 'codingEngineering',
    description: 'Updated terminal-agent benchmark for autonomous command-line execution.',
  },
  {
    id: 'osworld',
    llmStatsSlug: 'osworld',
    name: 'OSWorld',
    category: 'Computer Use',
    dimension: 'agentsAutonomy',
    description: 'Real desktop/web application tasks across operating systems and multi-app workflows.',
  },
  {
    id: 'apex-agents',
    llmStatsSlug: 'apex-agents',
    name: 'APEX-Agents',
    category: 'Long-Horizon Agents',
    dimension: 'agentsAutonomy',
    description: 'Long-horizon professional tasks requiring sustained planning and execution.',
  },
  {
    id: 'vita-bench',
    llmStatsSlug: 'vita-bench',
    name: 'VITA-Bench',
    category: 'Virtual Tasks',
    dimension: 'agentsAutonomy',
    description: 'Virtual task automation for multi-step real-world workflows.',
  },
  {
    id: 'deep-planning',
    llmStatsSlug: 'deep-planning',
    name: 'DeepPlanning',
    category: 'Planning',
    dimension: 'agentsAutonomy',
    description: 'Complex multi-step planning, goal decomposition, and long-horizon reasoning.',
  },
  {
    id: 'officeqa-pro',
    llmStatsSlug: 'officeqa-pro',
    name: 'OfficeQA Pro',
    category: 'Office Work',
    dimension: 'agentsAutonomy',
    description: 'Professional knowledge-work tasks involving documents, spreadsheets, and office workflows.',
  },
  {
    id: 'finance-agent-v2',
    llmStatsSlug: 'finance-agent-v2',
    name: 'Finance Agent v2',
    category: 'Finance Work',
    dimension: 'agentsAutonomy',
    description: 'Agentic financial analysis workflows over realistic business tasks.',
  },
  {
    id: 'tau-bench',
    llmStatsSlug: 'tau-bench',
    name: 'Tau-bench',
    category: 'Tool Agents',
    dimension: 'toolSearchReliability',
    description: 'Tool-agent-user interaction with domain rules and repeated-trial reliability.',
  },
  {
    id: 'tau-bench-retail',
    llmStatsSlug: 'tau-bench-retail',
    name: 'TAU-bench Retail',
    category: 'Tool Agents',
    dimension: 'toolSearchReliability',
    description: 'Retail customer-service agent tasks with tools, policies, and user interaction.',
  },
  {
    id: 'tau-bench-airline',
    llmStatsSlug: 'tau-bench-airline',
    name: 'TAU-bench Airline',
    category: 'Tool Agents',
    dimension: 'toolSearchReliability',
    description: 'Airline customer-service agent tasks with tools, policies, and user interaction.',
  },
  {
    id: 'mcp-atlas',
    llmStatsSlug: 'mcp-atlas',
    name: 'MCP Atlas',
    category: 'Tool Use',
    dimension: 'toolSearchReliability',
    description: 'Scaled tool coordination across complex multi-step tool-use tasks.',
  },
  {
    id: 'toolathlon',
    llmStatsSlug: 'toolathlon',
    name: 'Toolathlon',
    category: 'Tool Use',
    dimension: 'toolSearchReliability',
    description: 'Multi-tool proficiency across diverse tool-use categories.',
  },
  {
    id: 'browsecomp',
    llmStatsSlug: 'browsecomp',
    name: 'BrowseComp',
    category: 'Search',
    dimension: 'toolSearchReliability',
    description: 'Persistent web browsing and hard-to-find information retrieval.',
  },
  {
    id: 'widesearch',
    llmStatsSlug: 'widesearch',
    name: 'WideSearch',
    category: 'Search',
    dimension: 'toolSearchReliability',
    description: 'Broad, parallel search operations across multiple sources.',
  },
  {
    id: 'deepsearchqa',
    llmStatsSlug: 'deepsearchqa',
    name: 'DeepSearchQA',
    category: 'Search',
    dimension: 'toolSearchReliability',
    description: 'Multi-hop deep search and answer retrieval.',
  },
];

const PENDING_BENCHMARKS = [
  {
    id: 'gaia',
    name: 'GAIA',
    reason: 'Not available from the tested LLM Stats benchmark endpoint.',
  },
  {
    id: 'simplebench',
    name: 'SimpleBench',
    reason: 'Not available from the tested LLM Stats benchmark endpoint.',
  },
  {
    id: 'arc-agi-3',
    name: 'ARC-AGI-3',
    reason: 'Not available from the tested LLM Stats benchmark endpoint.',
  },
  {
    id: 'metr-time-horizons',
    name: 'METR Time Horizons',
    reason: 'Important autonomy signal, but not available as a daily LLM Stats benchmark endpoint.',
  },
];

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toDateLabel(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isDailyHistoryEntry(entry) {
  return entry?.formula === 'agi-readiness-v2' && /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(entry.date ?? '');
}

async function apiFetch(pathname) {
  const url = `${API_BASE}${pathname}`;
  const headers = API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`llm-stats API error ${res.status} on ${pathname}: ${text}`);
  }
  return res.json();
}

async function getBenchmarkResult(benchmark) {
  try {
    const data = await apiFetch(`/leaderboard/benchmarks/${encodeURIComponent(benchmark.llmStatsSlug)}?top_n=1`);
    const entry = data?.entries?.[0];
    const raw = entry?.benchmark_score ?? entry?.normalized_score;
    if (!entry || typeof raw !== 'number' || Number.isNaN(raw)) return null;
    return {
      score: round(raw * 100, 1),
      scoreRaw: raw,
      modelName: entry.model_name ?? entry.model_id ?? null,
      modelId: entry.model_id ?? null,
      totalModels: data.total_models ?? null,
      benchmarkName: data.benchmark_name ?? benchmark.name,
      source: `llm-stats:${benchmark.llmStatsSlug}`,
    };
  } catch (err) {
    console.warn(`  ! Could not fetch ${benchmark.name} (${benchmark.llmStatsSlug}): ${err.message}`);
    return null;
  }
}

function calculateDimensions(benchmarks) {
  return DIMENSIONS.map((dimension) => {
    const items = benchmarks.filter((b) => b.dimension === dimension.id && typeof b.score === 'number');
    const score =
      items.length > 0 ? round(items.reduce((sum, b) => sum + b.score, 0) / items.length, 1) : null;
    return {
      ...dimension,
      score,
      distance: typeof score === 'number' ? round(100 - score, 1) : null,
      benchmarkCount: items.length,
    };
  });
}

function calculateReadiness(dimensions) {
  const valid = dimensions.filter((d) => typeof d.score === 'number');
  const totalWeight = valid.reduce((sum, d) => sum + d.weight, 0);
  if (!totalWeight) return null;
  return round(valid.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight, 1);
}

function findBottleneck(dimensions) {
  return dimensions
    .filter((d) => typeof d.score === 'number')
    .sort((a, b) => a.score - b.score)[0];
}

function getTrend(id, score, previousBenchmarks) {
  const previous = previousBenchmarks?.find((b) => b.id === id);
  if (!previous || typeof previous.score !== 'number' || typeof score !== 'number') return 'new';
  const delta = score - previous.score;
  if (Math.abs(delta) < 0.1) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

function estimateETA(history) {
  if (!Array.isArray(history) || history.length < 30) {
    return {
      status: 'collecting_baseline',
      year: null,
      marginDays: null,
      note: 'New AGI readiness formula needs at least 30 fresh daily samples before an honest trend can be estimated.',
    };
  }

  const recent = history.slice(-30);
  const n = recent.length;
  const xs = recent.map((_, i) => i);
  const ys = recent.map((h) => h.agiReadiness ?? h.index).filter((v) => typeof v === 'number');
  if (ys.length !== n) return { status: 'collecting_baseline', year: null, marginDays: null };

  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const denominator = xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0);
  const slope = xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0) / denominator;
  if (!Number.isFinite(slope) || slope <= 0.05) {
    return { status: 'trend_unclear', year: null, marginDays: null };
  }

  const daysFromNow = Math.round((100 - ys[ys.length - 1]) / slope);
  if (daysFromNow <= 0 || daysFromNow > 3650) {
    return { status: 'trend_unclear', year: null, marginDays: null };
  }

  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + daysFromNow);
  return {
    status: 'estimated',
    year: etaDate.getFullYear(),
    marginDays: Math.max(1, Math.round(daysFromNow * 0.35)),
    daysFromNow,
  };
}

async function main() {
  console.log('AGI Clock Collector - starting...');
  if (!API_KEY) {
    console.log('LLM_STATS_API_KEY is not set; using public leaderboard endpoints only.');
  }

  const now = new Date().toISOString();
  const dateLabel = toDateLabel();

  let previous = {};
  try {
    previous = JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {}

  const previousBenchmarks = previous.benchmarks ?? [];
  const previousHistory = Array.isArray(previous.history) ? previous.history : [];
  const legacyHistory = previous.legacyHistory ?? previousHistory;

  const fetched = await Promise.all(
    BENCHMARKS.map(async (benchmark) => {
      process.stdout.write(`  ${benchmark.name} (${benchmark.llmStatsSlug})...`);
      const result = await getBenchmarkResult(benchmark);
      const fallback = previousBenchmarks.find((b) => b.id === benchmark.id);
      const merged = result
        ? { ...benchmark, ...result }
        : {
            ...benchmark,
            score: fallback?.score ?? fallback?.aiScore ?? null,
            scoreRaw:
              typeof fallback?.score === 'number'
                ? fallback.score / 100
                : typeof fallback?.aiScore === 'number'
                  ? fallback.aiScore / 100
                  : null,
            modelName: fallback?.modelName ?? null,
            modelId: fallback?.modelId ?? null,
            totalModels: fallback?.totalModels ?? null,
            source: fallback?.source ?? `llm-stats:${benchmark.llmStatsSlug}`,
          };
      merged.trend = getTrend(benchmark.id, merged.score, previousBenchmarks);
      process.stdout.write(` ${typeof merged.score === 'number' ? `${merged.score.toFixed(1)}%` : 'N/A'}\n`);
      return merged;
    })
  );

  const dimensions = calculateDimensions(fetched);
  const agiReadiness = calculateReadiness(dimensions);
  const agiDistance = typeof agiReadiness === 'number' ? round(100 - agiReadiness, 1) : null;
  const bottleneck = findBottleneck(dimensions);

  const history = previousHistory.filter(isDailyHistoryEntry);
  const lastEntry = history[history.length - 1];
  const entry = {
    date: dateLabel,
    agiReadiness,
    agiDistance,
    bottleneckDimension: bottleneck?.id ?? null,
    updatedAt: now,
    formula: 'agi-readiness-v2',
  };
  if (!lastEntry || lastEntry.date !== dateLabel) history.push(entry);
  else history[history.length - 1] = entry;

  const eta = estimateETA(history);

  const output = {
    schemaVersion: 2,
    formula: 'agi-readiness-v2',
    updatedAt: now,
    agiReadiness,
    agiDistance,
    bottleneckDimension: bottleneck
      ? {
          id: bottleneck.id,
          name: bottleneck.name,
          score: bottleneck.score,
          distance: bottleneck.distance,
        }
      : null,
    eta,
    dimensions,
    benchmarks: fetched.map((b) => ({
      id: b.id,
      slug: b.llmStatsSlug,
      name: b.name,
      category: b.category,
      dimension: b.dimension,
      score: b.score,
      scoreRaw: b.scoreRaw,
      modelName: b.modelName,
      modelId: b.modelId,
      totalModels: b.totalModels,
      trend: b.trend,
      source: b.source,
      description: b.description,
    })),
    pendingBenchmarks: PENDING_BENCHMARKS,
    history,
    legacyHistory,
    notes: [
      'AGI Readiness is a benchmark-based proxy, not a claim that AGI has been reached.',
      'The current score is a frontier mix: best available model per benchmark, not one single model passing all tasks.',
      'ETA is withheld until the v2 formula has enough fresh daily history.',
    ],
  };

  await fs.writeFile(OUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`\nAGI Readiness: ${agiReadiness}%`);
  console.log(`AGI Distance: ${agiDistance}%`);
  console.log(`Bottleneck: ${bottleneck?.name ?? 'unknown'} (${bottleneck?.score ?? '?'}%)`);
  console.log(`Written to ${OUT}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
