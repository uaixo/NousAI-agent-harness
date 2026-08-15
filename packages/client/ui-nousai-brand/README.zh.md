# `@deepseek-ai/dsh-client-ui-nousai-brand`

[English](README.md) | 中文

Web GUI 引导链的 NousAI 部署品牌化。浏览器半以优先级 −1 遮蔽原有 `settings.onboarding` 槽位单元 id `welcome-notice`（由 [`ui-settings-models`](../ui-settings-models/README.md) 以默认优先级注册），替换为一个立即完成的步骤，因此 NousAI 部署不展示 DeepSeek 品牌的内测须知。这是单元遮蔽而非移除：原条目仍在台账上，本插件卸载或崩溃时自动回归。供应商引导——提供方 API 密钥步骤——刻意不动，因为它点名的是模型供应商而非产品。由 [`dsh-nousai-web-app`](../../bundle/nousai-web-app/README.md) bundle 补丁挂载；node 半是空的花名册条目。

## Model Experience

无：本插件只在浏览器中替换一个引导步骤；这里没有任何东西进入模型请求。

#### KV Cache effect

无；本包既不组装也不发送提供方请求。

## Known Limitations and Deferred Work

- **须知被抑制而非改写** — 之后可以用 NousAI 自撰的欢迎须知（自有文案、自有确认命名空间）替换该跳过步骤；目前部署直接没有首次运行须知。
