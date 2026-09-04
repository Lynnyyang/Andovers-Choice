# Andover's Choice

**English** | [中文](README.zh-CN.md)

An interactive tutorial on **difference-in-differences (DID)**. You play an economist hired to judge whether a new incinerator lowered house prices in North Andover — and to do it with a credible causal design, not a naive comparison of means.

*Andover's Choice* is the English name of the in-app title「北安德沃的抉择：DID分析实战教程」. The UI is in Chinese.

Repository: <https://github.com/Lynnyyang/Andovers-Choice>

---

## What this is

A client-only web game. House prices are drawn from a known data-generating process (DGP) in `src/utils/dataGeneration.ts`. You do **not** estimate the DGP live until later scenes (several of those scenes are still placeholders).

Core idea of DID in this case:

```
price = 105000
        + 10000·Y81
        − 20000·NEARINC
        − 15000·Y81×NEARINC
        + house-characteristic terms
        + error
```

$$
\mathrm{price} = 105000 + 10000\cdot Y_{81} - 20000\cdot\mathrm{NEARINC} - 15000\cdot Y_{81}\times\mathrm{NEARINC} + \text{age/area/rooms} + \varepsilon
$$

| Symbol | Meaning | Coding |
| --- | --- | --- |
| $\mathrm{price}$ | House price (USD) | Continuous |
| $Y_{81}$ | After incinerator (1981 vs 1978) | 1981 = 1 |
| $\mathrm{NEARINC}$ | Near the incinerator | Near = 1 |
| $Y_{81}\times\mathrm{NEARINC}$ | DID term (policy effect $\delta_1$) | Interaction; DGP value $-15000$ |

A before/after comparison or a near/far comparison alone is confounded. DID uses **both** time and location.

This setup follows the classic North Andover incinerator / house-price example used in DID teaching.

---

## Story path (eight scenes)

Sidebar navigation in `Navigation.tsx`. Only the first two scenes are fully built.

| Scene | Status | What you do |
| --- | --- | --- |
| 委托任务 (Prologue) | Implemented | Three questions: causal identification, DID ingredients, why you need time **and** space |
| 数据搜集 (Data collection) | Implemented | $3000 budget, $100 per house; click near/far on a D3 map; toggle 1978 / 1981; score rewards balanced cells |
| 初步分析 | Placeholder | Descriptive stats and simple regression |
| DID突破 | Placeholder | Parallel trends and DID logic |
| 模型解剖 | Placeholder | Structure of the DID regression |
| 最终裁决 | Placeholder | Policy-effect judgment |
| 学习总结 | Placeholder | Recap |
| 学习证书 | Placeholder | Certificate from scores and duration |

Progress is sequential: finishing a scene unlocks the next (`useGameState`).

---

## Data collection rules

- Start with **$3000**; each sampled house costs **$100**.
- Choose **near** vs **far** and **1978** vs **1981**.
- Scores mix **cell balance** (60%) and **budget efficiency** (40%).
- A participation bonus is added when tasks are completed.

---

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 5, TypeScript |
| UI | React 18, Tailwind CSS, shadcn/ui |
| Map | D3 |
| Routing | React Router (`/` and 404) |

Dev server port **8080**. Scaffolded with Lovable.

---

## Run locally

Node.js and npm required.

```bash
git clone https://github.com/Lynnyyang/Andovers-Choice.git
cd Andovers-Choice
npm install
npm run dev
```

Open the URL in the terminal (typically `http://localhost:8080`).

```bash
npm run build
npm run preview
npm run lint
```

No backend, no env vars, no API keys.

---

## Layout

```
src/
  pages/Index.tsx
  hooks/useGameState.ts          # scene unlock, scores, budget, year
  types/index.ts
  utils/dataGeneration.ts        # DGP, sampling, balance/efficiency scores
  components/
    Navigation.tsx
    SceneRenderer.tsx            # wired scenes + placeholders
    D3Map.tsx
    scenes/PrologueScene.tsx
    scenes/DataCollectionScene.tsx
    ui/
```

---

## Limits

- Scenes after data collection are “coming soon” stubs.
- Prices come from a simulated DGP, not Kiel–McClain microdata.
- Predicted prices are floored at $50,000 in the generator.
- The original README was a Lovable template.

---

## License

[MIT](LICENSE)
