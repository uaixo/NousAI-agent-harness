---
description: "Web GUI 的 NousAI 部署品牌化：以 NousAI 标识填充浏览器品牌插槽，并抑制 DeepSeek 品牌的内测欢迎须知。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-nousai-brand

[English](README.md) | 中文

## 概述

NousAI 部署的浏览器品牌来自本插件：侧边栏与会话主视觉品牌插槽中的 NousAI 标识，以及首次运行时不出现 DeepSeek 品牌的内测须知。它填充 `sidebar.brand.mark`、`sidebar.brand.name` 与 `conversation.hero.brand.mark`——原生 UI 在官方构建之外让这些插槽留空——并以一个立即完成的步骤遮蔽原有 `settings.onboarding` 欢迎步骤。抑制是可逆的单元遮蔽而非移除：原条目仍在台账上，本插件卸载或崩溃时自动回归。供应商引导——提供方 API 密钥步骤——刻意不动，因为它点名的是模型供应商而非产品。

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

常见路径是 [`dsh-nousai-web-app`](../../bundle/nousai-web-app/README.zh.md) bundle 补丁，它会为你插入本包的浏览器行。

### 何时选择它

只要组合服务的是 NousAI 前端构建就挂载它：该构建把 `ui-primitives` 别名为 NousAI 品牌模块，而本插件正是把这些标识放进品牌插槽并清除 DeepSeek 首次运行须知的那一环。原生组合中请跳过——那里的 DeepSeek 品牌是有意为之，这些占位者会把 GUI 标成 NousAI。

### 最小配置

本包不接受配置。它作为普通浏览器花名册行挂载（node 半是空的花名册条目）：

```yaml
- id: ui-nousai-brand
  name: '@deepseek-ai/dsh-client-ui-nousai-brand'
```

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现内部——点击展开</summary>

浏览器半注册三个品牌插槽占位者——`sidebar.brand.mark`、`sidebar.brand.name` 与 `conversation.hero.brand.mark`——渲染从 `ui-primitives` 导入的 NousAI 标识，而 NousAI 构建把该模块替换为 NousAI 品牌模块，插槽占位者与所有直接消费者因此共用同一份图形。它还以优先级 −1 遮蔽原有 `settings.onboarding` 槽位单元 id `welcome-notice`（由 [`ui-settings-models`](../ui-settings-models/README.zh.md) 以默认优先级注册），替换为一个立即完成、不渲染任何内容的步骤。所有注册都随 fiber 释放。

### 源码地图

| 文件 | 角色 |
|---|---|
| [`src/client/index.ts`](src/client/index.ts) | 浏览器入口：品牌插槽占位者与引导遮蔽 |
| [`src/client/Brand.tsx`](src/client/Brand.tsx) | 基于 `ui-primitives` 品牌模块的标识与字标占位者 |
| [`src/client/NousAiWelcomeSkip.tsx`](src/client/NousAiWelcomeSkip.tsx) | 立即完成的引导步骤 |
| [`src/index.ts`](src/index.ts) | node 半：空的花名册条目 |
| [`src/invariant.ts`](src/invariant.ts) | 不变量伴随：无运行时不变量；每项贡献都随注册表释放 |
| [`tests/browser-plugin.client.spec.tsx`](tests/browser-plugin.client.spec.tsx) | 插槽填充、单元遮蔽与释放行为 |

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

阅读这些页面了解挂载本行的 bundle 与它所依赖的插槽机制。

- [dsh-nousai-web-app](../../bundle/nousai-web-app/README.zh.md)——插入本行的 bundle 补丁。
- [ui-settings-models](../ui-settings-models/README.zh.md)——被遮蔽的欢迎须知的所有者。
- [ui-sidebar](../ui-sidebar/README.zh.md)——渲染本插件填充的侧边栏品牌插槽。
- [ui-conversation](../ui-conversation/README.zh.md)——渲染本插件填充的主视觉品牌插槽。

-----

<a id="model-experience"></a>
## 模型体验

无：本插件只在浏览器中填充品牌插槽并替换一个引导步骤；这里没有任何东西进入模型请求。

#### KV 缓存影响

无；本包既不组装也不发送提供方请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>

- **须知被抑制而非改写**——之后可以用 NousAI 自撰的欢迎须知（自有文案、自有确认命名空间）替换该跳过步骤；目前部署直接没有首次运行须知。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>
