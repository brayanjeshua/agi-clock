# AGI Clock

> Tracking humanity's last invention — in real time.

Open-source landing and dashboard that estimates AI progress toward Artificial General Intelligence. Shows **AGI Readiness** (0–100%) as a benchmark-based proxy across reasoning, engineering, autonomy, tool use, search, and reliability signals.

---

## How it works

1. **Daily collector** (`scripts/collect.mjs`) fetches frontier scores for tracked benchmarks from the [llm-stats.com API](https://llm-stats.com/developer)
2. Calculates a weighted AGI Readiness proxy and AGI Distance
3. Updates `src/data/live.json` and commits to the repo via GitHub Actions
4. GitHub Pages deploys the updated static site from the `dist` artifact

## Benchmarks tracked

| Dimension | Weight | Included signals |
|-----------|--------|------------------|
| Reasoning + Expert Knowledge | 30% | ARC-AGI v2, Humanity's Last Exam, GPQA, MMLU-Pro, FrontierMath |
| Coding + Engineering | 25% | SWE-Bench Verified, SWE-Bench Pro, LiveCodeBench v6, Terminal-Bench, Terminal-Bench 2.1 |
| Agents + Autonomy | 30% | OSWorld, APEX-Agents, VITA-Bench, DeepPlanning, OfficeQA Pro, Finance Agent v2 |
| Tool Use + Search Reliability | 15% | Tau-bench, TAU retail/airline, MCP Atlas, Toolathlon, BrowseComp, WideSearch, DeepSearchQA |

**Important:** AGI Readiness is not a claim that AGI has been reached. It is a frontier-mix benchmark proxy: best available model per benchmark. The project also tracks pending benchmarks that need reliable daily sources before being automated.

The current ETA stays in `collecting_baseline` until the v2 formula has enough fresh daily history. Old history is preserved as `legacyHistory` because the previous formula is not comparable.

## Setup

### Frontend

```bash
pnpm install
pnpm dev      # dev server
pnpm build    # production build
```

### Data collector

1. Get an API key at [llm-stats.com/developer](https://llm-stats.com/developer)

2. Local test:
```bash
LLM_STATS_API_KEY=your_key node scripts/collect.mjs
```

3. GitHub Actions automation:
   - Repo → Settings → Secrets → Actions → New secret
   - Name: `LLM_STATS_API_KEY`, Value: your key
   - Workflow runs daily at 02:00 UTC — also triggerable manually

### Deploy (GitHub Pages)

- The repo includes `.github/workflows/deploy.yml`
- Build command: `pnpm build`
- Output directory: `dist`
- In GitHub, enable Pages with **Source: GitHub Actions**
- Every push to `master` deploys to `https://brayanjeshua.github.io/agi-clock/`

## Contributing

Open an issue to propose new benchmarks (include source, scoring direction, and whether it has a reliable daily API). PRs welcome.

## License

MIT — built by [Brayan Jeshua](https://brayanjeshua.com)
