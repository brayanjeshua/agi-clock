# AGI Clock

> Tracking humanity's last invention — in real time.

Open-source landing and dashboard that tracks AI benchmark progress toward Artificial General Intelligence. Shows a composite **AGI Index** (0–100%) based on expert-human performance thresholds across 6 key benchmarks.

---

## How it works

1. **Daily collector** (`scripts/collect.mjs`) fetches best scores for 6 benchmarks from the [llm-stats.com API](https://llm-stats.com/developer)
2. Calculates a weighted composite AGI Index and extrapolates an estimated arrival date
3. Updates `src/data/live.json` and commits to the repo via GitHub Actions
4. GitHub Pages deploys the updated static site from the `dist` artifact

## Benchmarks tracked

| Benchmark | Category | Expert Human | Weight |
|-----------|----------|-------------|--------|
| ARC-AGI v2 | Reasoning | 85% | 1.5× |
| SWE-Bench Verified | Engineering | 92% | 1.5× |
| FrontierMath | Mathematics | 5% | 1.0× |
| GPQA Diamond | Science | 69.3% | 1.0× |
| MMLU-Pro | Knowledge | 85% | 0.75× |
| LiveCodeBench | Coding | 78% | 1.25× |

**AGI definition:** AI surpasses expert-human threshold on *all* tracked benchmarks simultaneously.

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

Open an issue to propose new benchmarks (include source + expert-human baseline). PRs welcome.

## License

MIT — built by [Brayan Jeshua](https://brayanjeshua.com)
