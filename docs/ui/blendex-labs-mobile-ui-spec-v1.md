# Blendex Labs Mobile UI Specification v1

> Quality Engineering Mobile Workspace — Light Engineering Design
>
> 本文档汇总全部 15 个已定稿页面的结构、尺寸、颜色、字号、组件与状态规范，可直接交给开发实现。

---

## 0. 设计基础（Design Foundations）

### 0.1 视觉定位

- **Light Engineering Mobile Workspace**：Professional · Clean · Minimal · iOS Style · High readability
- 不采用：Dashboard 卡片堆叠、深色 AI 风格、渐变、大面积彩色 Banner、表格化输入

### 0.2 颜色

| Token | 值 | 用途 |
|---|---|---|
| Background | `#FAFAFC` | 页面背景（非纯白） |
| Surface | `#FFFFFF` | 卡片 / 列表 / 输入表面 |
| Ink | `#111827` | 标题、主文字、主按钮 |
| Body | `#1F2937` | 正文（文章阅读） |
| Secondary | `#6B7280` | 描述、辅助文字 |
| Faint | `#9CA3AF` | 时间、占位符、弱信息 |
| Hairline | `#E5E7EB` | 边框、分隔线 |
| Fill | `#F3F4F6` | 输入背景、未激活 Chip |
| Brand | `#6366F1` | 唯一品牌强调色（AI、激活态、链接） |
| Brand Soft | `#EEF2FF` | 品牌浅底（AI 卡、Tag） |
| Success | `#16A34A` / bg `#DCFCE7` | 达成、Accept、In Control |
| Warning | `#B45309` / bg `#FEF3C7` | 临界、Trend、Conditional |
| Danger | `#DC2626` / bg `#FEE2E2` | 未满足、Reject、OOC |

### 0.3 工具色体系

| 工具 | 颜色 |
|---|---|
| CPK | `#6366F1` |
| MSA | `#10B981` |
| 8D | `#2563EB` |
| Reliability | `#F97316` |
| DOE | `#8B5CF6` |
| Sampling | `#14B8A6` |
| SPC | `#111827` |

图标规范：统一 32px（快捷卡）/ 40px（列表图标），浅色底（工具色 10% 透明度）+ 工具色图标。

### 0.4 字号基准（锁定，全站一致）

| 层级 | 字号 / 字重 |
|---|---|
| App Header 品牌 | 17px / 700 |
| 页面主标题 | 24–26px / 800 |
| 区块标题 | 16px / 700 |
| 卡片/列表标题 | 14–15px / 600–700 |
| 正文/描述 | 13px |
| 次要/辅助/时间 | 11–12px |
| Chips / 徽标 | 10–12px |
| 按钮 | 15px |
| 指标值（Metric Bar） | 18px / 800 |

数字一律 `tabular-nums`。

### 0.5 布局与形状

- 手机视口：390 × 844；页面可垂直滚动，首屏优先
- 内容左右 Padding：24px（内容宽 342px）
- Header 高度：52px；底部导航：72px
- 圆角：卡片 16 / 输入 10–12 / Chip 999（胶囊）
- 卡片阴影：`0 2px 8px rgba(0,0,0,0.04)`

---

## 1. 全局组件

### 1.1 App Header

- 52px，背景 `#FAFAFC`
- 左：Logo 30px（#6366F1 圆角方块 “B”）+ “Blendex Labs”（17/700）
- 右：☰（24px，#111827）
- 工具/流程页：左为返回箭头（24px）+ 页面标题（18/700）

### 1.2 Bottom Navigation

- 固定底部 72px，白底，顶部 1px `#E5E7EB`
- 5 Tab 均分：Home / Workspace / AI Assistant / Reports / More
- 激活态：#6366F1（图标 + 文字 600）；未激活：#6B7280
- 阅读页（Article Detail）默认隐藏，退出阅读恢复

### 1.3 Metric Summary Bar（锁定）

- 4 等分单行，高度 64px，白底，细分隔线，圆角 14
- 小号标签（10px 大写）+ 强调值（18px/800）
- **无副描述**；状态色仅用于数值（需要时橙色/红色/绿色）
- 整体判定由 Status Banner 负责，指标区不重复说明

### 1.4 Decision Banner

- 高度 ≥72px，圆角 14，左图标 32px 圆
- 标题 18/700 + 说明 14px
- 语义色：Green（Meets/Accept/In Control）· Amber（Marginal/Need Confirmation/Trend）· Red（Not Met/Reject/OOC）

### 1.5 Insight / Action 列表

- Insight：每条高 40px，严重度圆点（红/琥珀/灰/绿）+ 14px 文本，最多 3 条
- Action：编号圆点 + 14px 文本，最多 3 条，行动清单（非按钮）

### 1.6 AI Context Button

- 56px 全宽，#6366F1，白字 15/600，前缀 sparkles 图标
- 下方 Context Chips：`#EEF2FF` 底 + `#6366F1` 文字（12px）
- 始终携带只读摘要上下文，原始数据不出设备

### 1.7 底部操作栏

- 白底 + 顶部 hairline；双按钮：Save（Secondary）+ Generate Report（Primary #111827）

---

## 2. 页面清单与规范

### 2.1 Home（工作台）

结构：Status Bar → App Header → Hero → 今日状态 → 继续上次 → Quick Start → Copilot 入口 → Recent Reports → Bottom Nav

- Hero：标题两行 “Quality engineering, made smarter and simpler.”（26/800）+ 问候（14，#6366F1）+ 描述（13）
- 今日状态：大数字行（待办 3 · 待审 2 · 风险 1），细线分隔
- 继续上次：单行 + 紫色进度线（6px，75%）
- Quick Start：4 个工具图标（40px 工具色）
- 最近报告：列表行（14/700 + 11px meta）

### 2.2 AI Quality Copilot

结构：App Header → Hero（图标 + 标题 + 两行副标题）→ AI Input → Suggestion Chips → Recent Conversations → Popular Topics → Bottom Nav

- Hero：紫色星光图标（38px，圆 #EEF2FF）+ “AI Quality Copilot”（24/800）+ “Your quality engineering expert. / Understand. Analyze. Decide.”（15px）
- 输入框：50px、圆角 25、白底、占位 “Ask anything about quality, analysis, standards...”
- Suggestion Chips：32px 高、白底、圆角 16（Cpk / SPC / 8D / MSA）
- Conversation Item：62px、标题 14/600、摘要 12、时间 12
- Topic Chips：30px、#F3F4F6
- 定位：Quality Engineering Copilot，非通用聊天页

### 2.3 Reports List（Report Library）

结构：App Header → Page Title → Filter Chips → Report List → Bottom Nav

- 标题 “Reports”（26/800）+ 描述（13）
- Filter Chips：32px、圆角 16，激活 #111827/白，未激活 #F3F4F6/#374151（All / Cpk / SPC / MSA / 8D / Custom）
- Report Card：78px、白底、圆角 16、阴影；图标 36px 工具色 + 名称 14/700 + 描述 12 + 日期 11 + StatusBadge（Completed 绿 / Needs Review 黄 / Draft 灰 / Failed 红）
- 点击进入 Report Detail（携带 reportId / toolType / language）

### 2.4 CPK Analysis 输入页（Tool Workflow 模板）

结构：App Header → Breadcrumb → Tool Hero → Step Indicator → Input Card → Specification → Analyze → Privacy → Bottom Nav

- Breadcrumb：`Tools / Cpk Analysis`（Tools 紫、页面名黑、14px）
- Step Indicator：3 步（激活圆 28px #111827，未激活 #E5E7EB）
- 输入卡：文本框 110px、边框 #D1D5DB、圆角 12、占位 14px
- 校验状态：绿（✓ N values detected / ✓ No invalid values）/ 红（Invalid value detected at line N）
- Specifications：折叠区（标题行 44px），LSL/USL 两列 + Target
- Analyze Data：48px 全宽 #111827；处理中 “Analyzing...” + spinner
- 隐私行：🔒 Your data is processed securely and not stored.（12px）
- 此结构为 MSA / DOE / Sampling 输入页复用模板

### 2.5 CPK Result / Decision Card

结构：App Header → Report Header → Decision Banner → Metric Bar → Chart Preview → Key Insights → Next Actions → Ask AI → Bottom Actions

- Report Header：零件名（24/800）+ “Process Capability Report” + 时间（13）
- Decision Banner：Marginal（#FEF3C7）/ Good（#DCFCE7）/ Not Met（#FEE2E2）
- Metric Bar：Cp 1.45 · Cpk 1.12（橙）· Pp 1.60 · Ppk 1.08（橙）
- Chart Preview：白卡圆角 16，直方图 + LSL/USL/Mean 标注（移动端仅趋势）
- Insights 3 条 / Actions 3 条
- AI：#6366F1，Context Chips：Cpk 1.12 / Cp 1.45 / Sample 32
- Bottom：Save + Generate Report

### 2.6 Workspace（工具工作台）

结构：App Header → Hero → Continue Analysis → Quick Analysis（横向卡片）→ All Methods → AI 引导 → Bottom Nav

- Resume Card：白卡圆角 16、进度条 6px #6366F1、Continue 按钮
- Quick Cards：112×112 横向滚动（非九宫格），工具色图标
- All Methods：行高 72 列表（图标 32 + 名称 14/700 + 描述 12 + StatusBadge Available/Beta/Coming Soon）
- AI 引导：浅紫卡（#EEF2FF + #6366F1）

### 2.7 Knowledge Home（知识首页）

结构：App Header → Hero → Search → Featured Insight → Explore Topics → Latest Articles → Related Tools → Bottom Nav

- Hero：“Quality Engineering Knowledge Hub”（26/800）
- Search：52px、圆角 16、白底
- Featured Card：白卡圆角 20；Tag（#EEF2FF/#6366F1）+ 标题 24/800 + 摘要 + meta
- Category Chips：36px、激活 #111827/白；横向滚动
- Article Item：96px 列表（标题 14/700 + 摘要 12 + meta 11）
- Related Tool：浅紫卡 + Open Tool 主按钮

### 2.8 Knowledge Article Detail

结构：Reading Header → Category Tag → Title → Meta → Summary Card → Contents（折叠）→ Article Content → Article Information（折叠）→ Related Tools → Related Articles → Ask AI（固定底部）

- Reading Header：56px，← + “Knowledge”（16/600）+ EN|中文（紫）
- Summary Card：白卡圆角 16，“Key Takeaway” 14/700 + 正文 16/1.6
- 正文：16px/1.75/#1F2937；H2 24/700；H3 20/700
- Insight Block：#EEF2FF + 左侧紫线
- 表格：横向滚动（overflow-x:auto）
- Article Information：默认折叠，仅 Source / Reference link / Version
- 阅读模式隐藏 Bottom Nav；Ask AI 固定底部（56px #6366F1）

### 2.9 MSA Analysis Flow

Entry → Study Setup（Step 1/3）→ Data Collection → Result（Decision Card）

- Entry：Hero + StudyTypeCard（Variable GRR 绿 / Attribute Agreement 蓝 / Type 1 紫，88px）
- Setup：垂直表单（Part Name/Number/Characteristic + Parts 10/Operators 3/Trials 2）
- Data Collection：Progress（Part 4 of 10）+ 大数字输入 + “Last value” 参考
- Result：Decision Banner（Marginal #FEF3C7）+ **Metric Bar（%GRR 18.4% 橙 · ndc 7 · EV 10% · AV 8%）** + Insights/Actions + AI

### 2.10 Reliability Analysis Flow

Entry → Life Data Input（Step 1/3）→ Result（Decision Card）

- Entry：Life Data Analysis / Reliability Prediction 卡片（橙 #F97316）
- Input：寿命数据文本框 + Test Information（折叠）+ Reliability Target（B10 目标 / Mission Time / Confidence）
- Result：Banner **Meets Life Requirement**（绿）+ Metric Bar（MTBF 18,500h · B10 1,200h 绿 · β 1.8 · Fail 12）+ Weibull 曲线（B10 Marker + Target Line）+ Insights/Actions + AI

### 2.11 DOE Analysis Flow

Entry → Experiment Overview → Run Tracking → Result（Decision Card）

- Entry：Experiment Card（96px，名称 + Factors/Runs + Status）
- Overview：Factors chips + Design/Runs/Response 信息
- Run Tracking：Run 1 of 16 进度 + 参数卡（两列）+ 大数字 Response 输入 + Pending/Completed 状态
- Result：Banner **Need Confirmation**（#FEF3C7）+ Metric Bar（R² 92% · Factors 3 · Runs 16 · Significant 2）+ Pareto（显著性阈值线）+ Insights/Actions + AI

### 2.12 8D Problem Solving Flow

Entry → Problem Overview → Decision Card

- Entry：Create New 8D 主按钮 + Case Card（100px，名称/阶段/进度/状态）
- Problem Overview：Problem Statement（120px）+ Customer/Product/Part/Date/Qty
- Decision Card：Banner（Verification Pending #FEF3C7）+ **D0–D8 Progress**（绿完成/紫当前/灰待定）+ Metric Bar（D3 ✓ · D4 ✓ · D5 ✓ · D6 Pending 橙）+ Evidence（折叠）+ Insights/Actions + AI（review this 8D）

### 2.13 SPC Analysis Flow

Entry → Monitoring → Decision Card

- Entry：Process Card（Connector Diameter · Out of Control / Inlet Pressure · In Control）+ Add New Process
- Monitoring：状态头 + Control Chart（UCL/CL/LCL + OOC 点 + 趋势标记）+ Signal List（红/黄/绿，每条 48px）
- Decision Card：Banner **Out of Control**（红）+ Metric Bar（Status Alert · OOC 2 · Trend 7 pts · Sigma 1.8）+ Insights/Actions + AI

### 2.14 Sampling Plan Flow

Entry → Inspection Setup → Inspection Result → Decision Card

- Entry：Create Sampling Plan + Recent Plans（Accept 绿 / Reject 红）
- Setup：Lot Information（Lot/Product/Level/Type）+ Sampling Parameters（AQL/RQL/Standard）
- Inspection Result：Metric Bar（n 125 · Ac 3 · Re 4 · AQL 1.0）+ 大数字输入（Inspected/Defects）+ 实时判断（Within acceptance criteria 绿）
- Decision Card：Banner **Lot Accepted**（绿）+ Metric Bar（n · Ac/Re · Defects · AQL）+ Evidence + OC Curve（AQL/RQL 点）+ Insights/Actions + AI

### 2.15 More / Settings

结构：App Header → Page Title → Preferences → Data & Privacy → AI Privacy → Support → About（最小化）→ Bottom Nav（More 激活）

- 标题 “More”（26/800）+ “Settings and app information”
- Preferences：Language（English · 中文）/ Appearance（Light Mode），行高 56
- Data & Privacy：Local Storage（带副文案）/ Clear Local Data（红）
- AI Privacy：浅紫卡（#EEF2FF）——仅发送摘要，原始数据不出设备 + Learn More
- Support：Help / Feedback / Report a Problem
- About：最小单行 `Blendex Labs — Version 1.0.0`
- Confirm Dialog：Clear Local Data → “Are you sure? This action cannot be undone.”（Cancel / Delete 红）

---

## 3. 页面状态通用规范

- Loading：Skeleton（标题块 / 段落块 / 图片块）
- Empty：`No articles found / Try another keyword` 类文案 + 引导
- Error：错误信息 + 重试入口（如 “Unable to calculate capability. Need at least 2 groups.”）
- Offline：`Offline mode / Showing saved articles`
- Confirm：危险操作二次确认（Cancel / Delete）

---

## 4. 端到端工作流闭环

```text
Knowledge Article → Related Tool → Analysis Result → Decision Card → Report → AI Copilot
```

七工具流程：CPK / MSA / SPC / DOE / 8D / Reliability / Sampling——全部复用同一 Decision Card / Metric Bar / Banner / Insight / Action / AI Context 体系。

---

## 5. 组件清单（Component Library）

App Header · Bottom Navigation · Status Badge · Chip（Filter/Category/Topic）· Button（Primary/Secondary/AI/Icon）· Metric Summary Bar · Decision Banner · Insight List · Action List · AI Context Button · Progress Tracker（8D D0–D8 / Wizard 3 步）· Card（Report/Article/Case/Process/Experiment）· Input（Form/Textarea/大数字）· Collapsible Section（Contents/Evidence/Test Info/Article Info）· Confirm Dialog · Toast · Empty/Loading/Error/Offline 状态容器
