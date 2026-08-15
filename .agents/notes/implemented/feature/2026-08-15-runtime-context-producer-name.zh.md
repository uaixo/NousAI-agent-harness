# Agent Note: 运行时上下文快照为读者写出自己的名字

Status: implemented

[English](2026-08-15-runtime-context-producer-name.md) | 中文

## 问题

每个会话开头都会有一份运行时上下文快照——文件策略、审批策略、subagent 委派范围——Web transcript（文本记录）为它渲染一行折叠的 `上下文注入`。这一行把生产者写成 `@deepseek-ai/dsh-system-prompt`，于是每次对话里读者看到的第一样东西就是一个 npm 包 id。

这个 id 本身就是错的。没有任何叫这个名字的插件产出该快照：产出它的是 `dsh-agent-loop` 中的 `RuntimeContextProjection`，而且记录下来的这个名称从未被任何代码当作模块说明符读取。它本来就是一个标签，而且是产品中唯一呈现为包名形态的标签——每个同类生产者记录的都是简短的子系统名称：`compact`、`cordis-host-runner`、`tool-jobs`、`time-context`。对于并非 DeepSeek 品牌的部署，这还意味着每一轮的 transcript 里都印着一个厂商作用域。

## 决策

`RuntimeContextProjection` 记录 `Runtime context` 作为自己的生产者名称，于是 transcript 中该行读作 `上下文注入 · Runtime context`。

这个名称是 [`runtime-context.ts`](../../../../packages/core/agent-loop/src/runtime-context.ts) 中的一个常量，同时承担两个角色：客户端逐字渲染的面向人的生产者名称，以及该 projection 的持久身份——`isOwned` 靠它找到自己必须取代的那份快照。两个角色天然同步，因为只有一个字符串；所有携带旧值的既有 fixture（测试前置数据）也随之一同更新。

这正是 [上下文来源标注决策](2026-08-04-web-context-source-and-steer-marks.md) 为这一行指出的补救办法：想要更好标签的生产者，应当在自己的来源字段中记录该标签。它刻意留在生产方一侧。客户端只从持久日志解析生产者名称，不保存任何插件 id 表，因此重命名绝不应当需要发布客户端，恢复的日志或外部日志也必须与实时会话投影出相同结果。

`Runtime context` 是展示用短语，而它的同类都是 kebab-case 标识符。这种不对称正是要点所在：同类的值命名的是真实存在的插件，而这一个命名的子系统没有可供命名的插件，它唯一的消费方是读者。

## 考虑过的替代方案

**在客户端把 id 映射为展示名称。** 在 `contextProvenance` 里写一个 `plugin === '@deepseek-ai/dsh-system-prompt' → 'Runtime context'` 分支，是可能的最小改动，且不触碰任何 fixture。它同时也是上下文来源决策明确排除的那一个选项：客户端不保存生产者 id 表，因为这类表会在每次重命名时失准，每新增一个生产者都要发布客户端，而且对本构建从未见过的日志根本无法命名。

**在 `plugin` 来源上新增独立的人类可读标签字段。** 保留 id 的持久性、在其旁渲染一个新的可选 `label`，可以保住该字段“插件 id”的读法。但这为一个生产者拓宽了持久的 `MessageSourceMap` 词汇表，而且并不能避免它本该避免的 fixture 变更：在该字段存在之前写下的日志不携带 label，于是所有 golden 仍会重新渲染出那个 npm id。持久面更大，改动量相同，性价比更差。

**记录真正的产出方 `@deepseek-ai/dsh-agent-loop`。** 这让该字段作为 id 是诚实的，且只需一行改动。但它仍然把一个 npm 包展示给每一位读者，而这正是问题本身；而且它命名的是实现包，不是这份快照真正讲述的东西。

**从上下文行中去掉生产者名称。** 只渲染角色即可去掉这个 npm id，无需重命名任何东西。但它同时也会从各自行中去掉 `AGENTS.md`、`skill-catalog` 和 `goal`，因为客户端无法只对一个生产者做特例——那等于用其他所有行的归属信息，去换一行的噪音。

**在 Chat 中隐藏运行时上下文行。** 该快照仍留在 Trajectory 页签和持久日志中，因此不会丢失任何模型可见内容，这一行也不再反复出现。但它把一项真实的模型可见输入，从读者跟读对话的界面上藏了起来，这比给这一行命名是更大的产品决策；若这一行日后确实被证明是噪音而非上下文，该选项依然可用。

## 测试

- `packages/core/agent-loop` 单元覆盖固定了新建快照上记录的来源，以及恢复、取代和清除既有快照的 `isOwned` 回放路径。
- `packages/client/ui-conversation` jsdom 覆盖固定了该行渲染出的可访问名称。
- 无密钥的组装式 Web golden，以及 ACP、headless、JSON-RPC 和 Python SDK 的会话日志都携带新的生产者名称，因此证明它的是组装后的 transcript，而不只是组件测试。

## 后果

- 产品中不再有任何生产者记录 `@scope/package` 形态的名称；仍呈现包名形态的只剩下带 `dsh-` 前缀的朴素名称（`dsh-compaction-basic`、`dsh-session-title-llm`）。
- 该名称是持久数据，因此本次改动之前写下的会话日志保留旧值。`isOwned` 不会匹配它：projection 会把这类会话视为没有既有快照，并在下一轮追加一份当前快照，被取代的那一行继续渲染旧名称。这属于发布前对磁盘格式的既定立场，不是迁移。
- 记录下来的生产者名称如今是面向读者的字符串。再次修改它就是一次 transcript 可见的编辑，并且会带动所有既有 fixture 一起变更。
