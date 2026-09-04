# Andover's Choice

[English](README.md) | **中文**

英文名 *Andover's Choice*，对应界面标题「北安德沃的抉择」。DID 交互教程：你扮演受雇经济学家，判断北安德沃新建焚化炉是否压低了房价——要用可信的因果设计，而不是简单比较均值。

界面为中文。完整标题为「北安德沃的抉择：DID分析实战教程」。

仓库：<https://github.com/Lynnyyang/Andovers-Choice>

---

## 这是什么

纯前端 Web 游戏。房价由 `src/utils/dataGeneration.ts` 中给定的数据生成过程（DGP）抽出。后面若干场景尚未实现，因此 **不会在那些场景里现场估计 DGP**。

本案例中 DID 的核心：

```
price = 105000
        + 10000·Y81
        − 20000·NEARINC
        − 15000·Y81×NEARINC
        + 房屋特征项
        + 误差
```

$$
\mathrm{price} = 105000 + 10000\cdot Y_{81} - 20000\cdot\mathrm{NEARINC} - 15000\cdot Y_{81}\times\mathrm{NEARINC} + \text{年龄/面积/房间} + \varepsilon
$$

| 符号 | 含义 | 编码 |
| --- | --- | --- |
| $\mathrm{price}$ | 房价（美元） | 连续 |
| $Y_{81}$ | 焚化炉建成之后（1981 相对 1978） | 1981 = 1 |
| $\mathrm{NEARINC}$ | 靠近焚化炉 | 靠近 = 1 |
| $Y_{81}\times\mathrm{NEARINC}$ | DID 项（政策效应 $\delta_1$） | 交互；DGP 取值为 $-15000$ |

只做前后对比或只做远近对比都会被混淆。DID 同时用 **时间** 和 **区位**。

故事背景是教学中常用的北安德沃焚化炉与房价案例。

---

## 剧情路径（八个场景）

侧边栏见 `Navigation.tsx`。目前只完整实现前两幕。

| 场景 | 状态 | 做什么 |
| --- | --- | --- |
| 委托任务 | 已实现 | 三道题：因果识别、DID 要素、为何要同时用时间与空间 |
| 数据搜集 | 已实现 | 预算 3000 美元，每套房子 100 美元；在 D3 地图上点近处/远处；切换 1978 / 1981；格子越均衡分越高 |
| 初步分析 | 占位 | 描述统计与简单回归 |
| DID突破 | 占位 | 平行趋势与 DID 逻辑 |
| 模型解剖 | 占位 | DID 回归结构 |
| 最终裁决 | 占位 | 政策效应判断 |
| 学习总结 | 占位 | 回顾 |
| 学习证书 | 占位 | 按分数与用时出证书 |

通关顺序解锁（`useGameState`）。

---

## 数据搜集规则

- 初始预算 **3000 美元**；每抽一套房 **100 美元**。
- 选择 **近 / 远** 与 **1978 / 1981**。
- 得分 = **格子均衡 60%** + **预算效率 40%**。
- 完成任务另有参与加分。

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 构建 | Vite 5、TypeScript |
| UI | React 18、Tailwind CSS、shadcn/ui |
| 地图 | D3 |
| 路由 | React Router（`/` 与 404） |

开发服务器端口 **8080**。由 Lovable 脚手架生成。

---

## 本地运行

需要 Node.js 与 npm。

```bash
git clone https://github.com/Lynnyyang/Andovers-Choice.git
cd Andovers-Choice
npm install
npm run dev
```

打开终端给出的地址（一般为 `http://localhost:8080`）。

```bash
npm run build
npm run preview
npm run lint
```

无后端、无环境变量、无需 API Key。

---

## 目录结构

```
src/
  pages/Index.tsx
  hooks/useGameState.ts          # 场景解锁、分数、预算、年份
  types/index.ts
  utils/dataGeneration.ts        # DGP、抽样、均衡/效率分
  components/
    Navigation.tsx
    SceneRenderer.tsx            # 已接线场景 + 占位
    D3Map.tsx
    scenes/PrologueScene.tsx
    scenes/DataCollectionScene.tsx
    ui/
```

---

## 局限

- 数据搜集之后的场景仍是「即将推出」。
- 房价来自模拟 DGP，不是 Kiel–McClain 原始微观数据。
- 生成器把房价下限设为 50,000 美元。
- 原先 README 是 Lovable 模板。

---

## 许可

[MIT](LICENSE)
