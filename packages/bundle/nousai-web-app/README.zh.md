---
description: "NousAI 品牌的浏览器 GUI：一个可安装的补丁层，为 dsh web 表层及其模型可见的产品身份完成换牌，供组合 NousAI profile 的用户使用。"
kind: "package-bundle"
---

# @deepseek-ai/dsh-nousai-web-app

[English](README.md) | 中文

## 概述

Web profile 从本层获得 NousAI 产品身份：带页面标题、favicon、PWA manifest、启动页字标与 NousAI 品牌标识的 NousAI 外壳 dist，加上点名 NousAI Harness 的模型可见角色设定——且不 fork 任何 UI 插件。没有内置 profile 包含它；一条 `dsh plugin` 命令即可将其叠加到原生 `web` profile 之上，用同一命令移除即可回到 DeepSeek 品牌。必须先构建 NousAI dist（`pnpm run build:web:nousai`）；缺失时激活会带该提示直接报错。供应商品牌刻意保持不动：DeepSeek LLM 提供方名称、`DEEPSEEK_API_KEY`、端点与模型名描述的是模型供应商而非产品。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

### 安装进 profile

```text
dsh plugin --profile web add @deepseek-ai/dsh-nousai-web-app
dsh plugin --profile web remove @deepseek-ai/dsh-nousai-web-app
```

reconcile 步骤把本包的 [`cordis.patch.yml`](cordis.patch.yml) 作为一层激活在 `dsh-base` 与 `dsh-web-app` 层之上；没有该补丁声明的包会作为普通插件行安装。先在 checkout 中用 `pnpm run build:web:nousai` 构建 NousAI dist——否则运行时行在激活时会带该构建提示直接报错。

### 你会得到什么

GUI 提供 NousAI 外壳：页面外观、启动页字标、以及侧边栏与主视觉品牌标识（插入的 [`ui-nousai-brand`](../../client/ui-nousai-brand/README.zh.md) 行填充浏览器品牌插槽），DeepSeek 品牌的内测须知被遮蔽出引导链。模型看到的是 NousAI 角色设定与 NousAI 措辞的表层上下文，而非原生身份。运行时胶水重述原生 web 胶水的四个配置字段（`openBrowser`、`printUrl`、`surfaceContext`、`trustedHosts`）；生成的[配置目录](../../../docs/config-catalog.zh.md#deepseek-aidsh-nousai-web-app)是每个可接受字段的完备来源。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现内部——点击展开</summary>

补丁停用原生 `web-runtime` 行（frontend-static 回退席位是单一所有者，因此采用停用后插入而非遮蔽），插入本包的 `nousai-web-runtime` 胶水与 `ui-nousai-brand` 浏览器行，并以 `includeHarnessIdentity: false` 加 NousAI 角色设定重述 `system-prompt` 行。胶水插件以 `@deepseek-ai/dsh-web-frontend-nousai` 包 manifest 为锚解析 NousAI 外壳 dist——这是本 bundle 的工作区知识，绝非用户配置——并以 NousAI 身份挂载 [`dsh-web-app`](../web-app/README.zh.md) 导出的共享 `applyWebRuntime` 胶水：dist 服务、NousAI 措辞的 `harness:source` 与 `app:web-surface` 提示词段、`DSH_WEB_URL` bash 变量、URL 行、以及默认浏览器交接。席位与就绪机制位于共享胶水中，因此两个运行时不会漂移。

### 源码地图

| 文件 | 角色 |
|---|---|
| [`cordis.patch.yml`](cordis.patch.yml) | 补丁：停用的原生运行时行、重述的 NousAI 角色设定、插入的运行时与品牌行 |
| [`src/index.ts`](src/index.ts) | `nousai-web-runtime` 胶水插件：dist 解析与 NousAI `applyWebRuntime` 身份 |
| [`src/invariant.ts`](src/invariant.ts) | 不变量伴随：无运行时不变量；每项贡献都随注册表释放 |
| [`tests/nousai-web-app.spec.ts`](tests/nousai-web-app.spec.ts) | dist 解析、提示词段、URL 行就绪、花名册身份 |

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

阅读这些页面了解本层所依赖的原生运行时与它挂载的品牌组件。

- [Bundle 包地图](../README.zh.md)——构建在同一核心上的各表层。
- [dsh-web-app](../web-app/README.zh.md)——原生 web 表层与共享运行时胶水。
- [ui-nousai-brand](../../client/ui-nousai-brand/README.zh.md)——本补丁插入的浏览器品牌行。
- [frontend-static](../../host/frontend-static/README.zh.md)——构建后的前端如何被服务。
- [生成的配置目录](../../../docs/config-catalog.zh.md#deepseek-aidsh-nousai-web-app)——每个可接受的配置字段及其源声明。

-----

<a id="model-experience"></a>
## 模型体验

### 换牌后的产品身份

#### 模型看到什么

固定的 "powered by DeepSeek Harness" 身份开场被抑制（`includeHarnessIdentity: false`）；部署角色设定改为点名 NousAI Harness。`surfaceContext` 为 true 时，`harness:source` 段与 `app:web-surface` 段以 NousAI 措辞承载与原 bundle 相同的定向信息，`DSH_WEB_URL` 的描述点名 NousAI Harness Web GUI。结构、段名与顺序与原 bundle 一致。

#### Token 影响

与原 Web 界面形状相同：一行角色设定、一行源码位置、一段提示词、两行受管环境变量说明；每进程恒定。

#### KV 缓存影响

这些段落位于系统提示词头部附近，进程生命周期内稳定，跨轮次不会失效缓存。安装或移除本 bundle 会改变进程之间的提示词前缀，与任何组合变更相同。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

以下是换牌层当前的约束，不是任务清单。

- **必须先构建 NousAI 前端 dist**——激活时 `require.resolve('@deepseek-ai/dsh-web-frontend-nousai/dist/index.html')` 失败即报错并提示 `pnpm run build:web:nousai`；没有源码直出回退，也不会回退到原 dist。
- **品牌图形为占位稿**——`apps/web-nousai/src/brand/` 中的 NousAI 标识用 SVG text 以页面字体绘制字标字形；正式品牌资产应改为路径字形。
- **该组合尚无免密钥 web 快照场景**——组装后的 NousAI GUI 目前由单元用例与手动组合启动验证；在 `apps/web` 快照场景中叠加本 bundle 的工作暂缓。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>
