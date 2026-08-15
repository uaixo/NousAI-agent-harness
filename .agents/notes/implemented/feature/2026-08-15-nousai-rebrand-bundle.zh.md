# Agent Note: 以可安装 bundle 完成 NousAI 换牌

Status: implemented

[English](2026-08-15-nousai-rebrand-bundle.md) | 中文

## Problem

某部署希望 Web GUI 使用 NousAI 产品品牌——logo、字标、页面身份、首次运行文案以及模型可见的产品名——同时 DeepSeek 模型供应商（提供方名称、`DEEPSEEK_API_KEY`、端点、模型名）保持原样。品牌标识是 `ui-sidebar` 与 `ui-conversation` 内的硬 ES 导入，页面身份（标题、favicon、PWA manifest、启动页字标）在任何插件激活之前就随 `apps/web` dist 送达，内测须知则是一个默认优先级的槽位注册——单个运行时插件无法完整触及这三处。

## Decision

换牌落地为一个可安装的补丁层 bundle，`@deepseek-ai/dsh-nousai-web-app`，覆盖三个接缝：

- **外壳替换。** `apps/web-nousai`（`@deepseek-ai/dsh-web-frontend-nousai`）以 NousAI 页面身份重建原外壳，并且——承重的一步——通过构建期别名把 NousAI 标识作为 `@deepseek-ai/dsh-client-ui-primitives` 平台模块提供，因此所有插件 bundle（ui-sidebar 字标、ui-conversation 主视觉标识）无需 fork 任何 UI 插件即完成换牌。内核启动页的 `HARNESS` 字面量由构建 transform 替换，因为它刻意位于一切插件接缝之外（外壳自足规则）。bundle 的胶水停用原 `web-runtime` 行，并以 NousAI dist 与措辞挂载 `applyWebRuntime`——已提取进 `dsh-web-app`、按品牌身份参数化的共享助手。
- **引导遮蔽。** `@deepseek-ai/dsh-client-ui-nousai-brand` 以优先级 −1 遮蔽 `settings.onboarding` 单元 id `welcome-notice`，替换为立即完成的步骤：该部署不出货 DeepSeek 品牌的内测须知，插件卸载时原条目自动回归。
- **模型可见身份。** 补丁以 `includeHarnessIdentity: false` 加 NousAI 角色设定重述 `system-prompt` 行；胶水注册 NousAI 措辞的 `harness:source` / `app:web-surface` 段与 `DSH_WEB_URL` 描述。

产品与供应商之分是范围规则：点名模型供应商 API 的字符串不是产品品牌，保持不动。

## Alternatives considered

**就地改写原包。** 预发布姿态允许自由改名，直接编辑 `FishLogo`/`BrandWordmark`/`index.html` 总代码量更小。但它失去本特性存在的前提：DeepSeek 原品牌与 NousAI 皮肤作为按 profile 的组合选择共存、上游不动。

**运行时遮蔽 `sidebar`/`conversation` 槽位。** 整区优先级遮蔽无需 fork dist，但遮蔽条目在原条目存活期间无法重声明其子槽位，`sidebar.workspaces`/`sidebar.settings`/页脚贡献将被放弃；且服务出的标题、favicon、manifest 与启动页无论如何仍是 DeepSeek 品牌。仅保留为引导单元的机制——那里被遮蔽条目没有子槽位。

**把 ui-sidebar 与 ui-conversation fork 成品牌包。** 停用加插入配合子槽位重声明能正确复原跨插件贡献，组合上可行——但为改两个 SVG 引用要复制两个大组件，主视觉标识仍需 fork conversation。平台模块替换用一个接缝同时换牌两处。

**主题 token。** `ctx.theme.overrideTokens` 只能换色，改不了 SVG 几何、页面身份与文案；单独不够。

## Consequences

- `dsh plugin --profile web add @deepseek-ai/dsh-nousai-web-app` 即可完整换牌一个 profile；移除 bundle 即恢复原品牌。两个外壳共用同一 vite 配置（`apps/web-nousai` 导入 `apps/web` 的），外壳变更不会在品牌间漂移。
- `dsh-web-app` 中共享的 `applyWebRuntime` 现在是 web-runtime 席位/就绪机制的唯一所有者；第三个品牌只需一个身份对象加一个 dist。
- NousAI dist 是第二个前端构建（`pnpm run build:web:nousai`），刻意不并入 `pnpm run build`：可选项不进默认出货，代价是未构建时激活报错并给出构建提示。
- 标识为占位稿（SVG text 字形）；正式 NousAI 资产直接放入 `apps/web-nousai/src/brand/`，无需改动其它任何东西。

## Testing

单元用例覆盖两个 bundle 的胶水（分支完整，逐文件 100%）与引导遮蔽的胜出/回归生命周期。组合后的产品经真实安装验证：把 bundle 写入 web profile（manifest 依赖 + `dsh.profile.bundles` 层）后免密钥启动——NousAI 标题、标识与侧栏收起态正常渲染；内测须知消失；供应商 API 密钥对话框保持不变。在 `apps/web` 快照场景中叠加本 bundle 的免密钥用例暂缓（已列入 bundle README 的 Known Limitations）。
