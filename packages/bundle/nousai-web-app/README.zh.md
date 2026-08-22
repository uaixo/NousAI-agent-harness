# `@deepseek-ai/dsh-nousai-web-app`

[English](README.md) | 中文

NousAI 品牌的浏览器界面 bundle：以一个可安装的补丁层完成 Web GUI 的产品换牌，不 fork 任何 UI 插件。[`cordis.patch.yml`](cordis.patch.yml) 叠加在 [`dsh-web-app`](../web-app/README.zh.md) 之上：停用原有 `web-runtime` 行，插入本包的 `nousai-web-runtime` 运行时胶水与 [`ui-nousai-brand`](../../client/ui-nousai-brand/README.zh.md) 浏览器行，并以 `includeHarnessIdentity: false` 加 NousAI 角色设定重述 `system-prompt` 行，使模型可见的产品身份与 GUI 一致。胶水插件通过 `@deepseek-ai/dsh-web-frontend-nousai` 的 exports 解析 NousAI 外壳 dist（该外壳提供 NousAI 页面标题、favicon、PWA manifest、启动页字标，并把 NousAI 标识作为 `ui-primitives` 平台模块提供，因此 ui-sidebar 的字标与 ui-conversation 的主视觉标识无需 fork 即完成换牌），随后以 NousAI 身份挂载 `dsh-web-app` 导出的共享 `applyWebRuntime` 胶水：frontend-static dist 服务、NousAI 措辞的 `harness:source` 与 `app:web-surface` 提示词段、`DSH_WEB_URL` bash 变量、`dsh web:` URL 行、以及默认浏览器交接（`openBrowser`；SSH 启动时抑制）。供应商品牌刻意保持不动：DeepSeek LLM 提供方名称、`DEEPSEEK_API_KEY`、端点与模型名描述的是模型供应商而非产品。用 `dsh plugin --profile web add @deepseek-ai/dsh-nousai-web-app` 安装进 profile；需先构建 NousAI dist（`pnpm run build:web:nousai`）。

## Model Experience

### 换牌后的产品身份

#### 模型看到什么

固定的 "powered by DeepSeek Harness" 身份开场被抑制（`includeHarnessIdentity: false`）；部署角色设定改为点名 NousAI Harness。`surfaceContext` 为 true 时，`harness:source` 段与 `app:web-surface` 段以 NousAI 措辞承载与原 bundle 相同的定向信息，`DSH_WEB_URL` 的描述点名 NousAI Harness Web GUI。结构、段名与顺序与原 bundle 一致。

#### Token 影响

与原 Web 界面形状相同：一行角色设定、一行源码位置、一段提示词、两行受管环境变量说明；每进程恒定。

#### KV 缓存影响

这些段落位于系统提示词头部附近，进程生命周期内稳定，跨轮次不会失效缓存。安装或移除本 bundle 会改变进程之间的提示词前缀，与任何组合变更相同。

## Known Limitations and Deferred Work

- **必须先构建 NousAI 前端 dist** — 激活时 `require.resolve('@deepseek-ai/dsh-web-frontend-nousai/dist/index.html')` 失败即报错并提示 `pnpm run build:web:nousai`；没有源码直出回退，也不会回退到原 dist。
- **品牌图形为占位稿** — `apps/web-nousai/src/brand/` 中的 NousAI 标识用 SVG text 以页面字体绘制字标字形；正式品牌资产应改为路径字形。
- **该组合尚无免密钥 web 快照场景** — 组装后的 NousAI GUI 目前由单元用例与手动组合启动验证；在 `apps/web` 快照场景中叠加本 bundle 的工作暂缓。
