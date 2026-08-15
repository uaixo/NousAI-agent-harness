# Agent Note: Default-branch CI triggers across the branch rename

Status: implemented

[English](2026-08-15-default-branch-ci-triggers.md) | 中文

## Problem

仓库的默认分支从 `master` 迁移到 `main`。七个工作流把 push 通道绑定在字面分支名上，`ci.yml` 中另有三个 job 以 `github.ref == 'refs/heads/master'` 作为守卫。重命名默认分支不会改写这些字面量，因此整条 push 通道——合并后 CI、文档部署、两条 release 打包序列、sandbox 证明，以及两条自托管待命演练——会停止触发，而 pull request 检查仍然通过，看上去仓库一切正常。

Actions 缓存作用域会放大这一故障。`wine-apt-cache` 与 `serial-linux` 的存在意义，正是填充每个 pull request 的 job 所读取的默认分支缓存作用域。一个绑定在非默认分支上的 job 无法承担该职责：该分支不再接收合并，job 因此不再运行；而从任何非默认 ref 保存的缓存，都会落在没有 pull request 读取的作用域中。

## Decision

每个 push 触发的工作流同时列出两个分支名 `branches: [main, master]`，`ci.yml` 中的三个 job 守卫通过显式析取接受任一 ref。同时列出两者，是为了让本次改动与默认分支重命名成为彼此独立的事件：无论两者以何种顺序发生，push 通道始终覆盖当时的默认分支，不存在任何无人运行的窗口。

原本把 `master` 称作该分支的注释，现在改称默认分支——分支名从来不是起作用的事实，缓存作用域、合并节奏与待命演练频率，跟随的都是当时的默认分支。

## Alternatives considered

**只把触发器指向 `main`。** 这会把工作流改动与重命名的确切时刻耦合在一起。先落地会切断仍为默认分支的 `master` 上的 push 通道；后落地则留下一段没有合并后 CI 的窗口。同时列出两者可消除这一顺序约束。

**动态解析默认分支。** `on.push.branches` 不接受表达式，且在触发器解析时不存在默认分支上下文。job 级 `if:` 可以与 `github.event.repository.default_branch` 比较，但触发器本身不行，因此七个文件中的分支名仍将是字面量，而机制却多出第二种形态。

**取消 push 通道，只依赖 pull request 检查。** 合并后通道证明的正是 pull request 无法证明的内容：默认分支缓存填充、针对已合并树的两条打包序列，以及让自托管资源池始终可证明地准备好接管必需通道的待命演练。

**保留 `master` 为默认分支，并在每次合并后快进它。** 这样能保住全部字面量，却把默认分支变成一面镜子——任何直接推送到 `main` 的操作都会无声地打破同步；而且仓库对外公示的分支，会与 pull request 实际指向的分支不一致。

## Consequences

两个分支同时存在期间，push 通道会在两者上触发，因此持有两个活跃分支头的仓库会重复运行其合并后通道。这一代价以重命名为界：一旦 `main` 成为默认分支且 `master` 被删除，`master` 就会从七个触发列表和三个守卫中移除，同时列出也不再有任何作用。现在改称默认分支的这些叙述，在重命名前后都保持准确，无需再次修改。

以 tag 触发、或仅以 `pull_request` 触发的工作流不受影响。仓库文档在描述外部维护工具时仍然提到 `origin/master`；这些引用指向该工具实际拉取的分支，不在本次改动范围内。
