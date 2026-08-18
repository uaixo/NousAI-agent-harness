# Agent Note: NousAI container image

Status: implemented

[English](2026-08-18-nousai-container-image.md) | 中文

## Problem

部署 NousAI web 界面意味着复现一个可用的 monorepo checkout：构建 `lib/`、构建 NousAI 前端 dist，并安装一个 bundle 图中链接三个仅存在于本 fork 的 workspace 包的 web profile。其中两步在朴素做法下会静默失败——`dsh plugin install` 在没有 manifest 时会脚手架出一个*默认* profile 并以零退出码结束，产出一个看似健康的 DeepSeek 原版界面；而 nousai bundle 的 `workspace:^` 同级版本范围无法从 monorepo 之外的 profile 解析，首次启动因此死于找不到包。

## Decision

一个双阶段 OCI 镜像（`Dockerfile`、`docker/`）在 Podman 与 Docker 下以相同方式构建。构建阶段编译 workspace（`build:lib` + `build:web:nousai`），并将 profile bundle 图解析进 `/opt/dsh-seed` 的一次性 `DSH_HOME` 种子：profile manifest（`docker/profile-package.json`）在运行 `dsh plugin install` *之前*写入，使默认 profile 脚手架不可能发生；三个 fork 包全部显式链接（`link:/app/...`），因为 `workspace:^` 离开 workspace 后即失效。若任一 NousAI 包未链接进种子 profile，构建即失败——两种静默失败模式都被转换为响亮的构建失败。

运行阶段携带构建好的 `/app` 与种子。`docker/entrypoint.sh` 仅在 profile 缺失时把种子复制进挂载的 `/data` 卷，仅在对应文件缺失时写入 `webserver` 绑定 patch（`0.0.0.0:3080`）与 LM Studio provider 设置文件，随后针对当前镜像重新链接 profile（失败时告警可见、启动继续），最后 exec `dsh web`。CLI 对 `--host 0.0.0.0` 的拒绝保持不变；profile patch 是 schema 合法的通道，其守护的暴露风险通过仅发布到环回地址（`-p 127.0.0.1:3080:3080`）恢复。在启用 SELinux 的宿主上（包括 `podman machine` 背后的 Fedora CoreOS 虚拟机）卷挂载需要 `:Z`；缺少它时，复用同一卷的第二个容器会获得不同的 MCS 类别，种子复制死于 `Permission denied`。

镜像携带包含 devDependencies 的完整 workspace：dsh 从自身安装树解析 profile bundle，`dsh plugin install` 又会调用 pnpm，两者都无法在裁剪后存活。构建上下文排除根目录 `.env`——`DEEPSEEK_API_KEY` 的文档化存放处——使 `COPY . .` 不可能把凭据烤进镜像。

## Sandbox posture

在 rootless 容器中，两级 Linux 沙箱都不可用：bwrap 无法创建嵌套用户命名空间；Landlock 启动器二进制是 release 工作流的预构建产物、`pnpm install` 不会产出，因此即使内核支持 Landlock（实测 ABI 9），功能探测也报告 `unusable`。启动与模型轮次不受影响；shell 命令会抛出 `SANDBOX_UNAVAILABLE`。部署方要么设置 `DSH_PERMISSION_MODE=danger-full-access` 并把容器本身当作边界，要么增加一个运行 `native/landlock-run` `build:native` 的构建阶段。镜像中刻意不解决：这是安全姿态决策，不是构建细节。重新引入条件：一旦确定容器内沙箱立场，即添加启动器构建阶段（或预构建拉取）并删除本段。

## Alternatives considered

**在首次启动时解析 bundle 图，而非构建期。** 容器启动时需要网络与 registry，且每个全新卷都会重新打开默认 profile 脚手架陷阱。构建期种子可离线启动，并在镜像构建时一次性断言。

**裁剪 devDependencies 以缩小运行镜像。** dsh 从自身安装树解析 profile bundle，`dsh plugin install` 又调用 pnpm；裁剪会同时破坏两者。体积代价换来的是一个能重新链接并扩展自身 profile 的运行时。

**用 `--privileged` 恢复 bwrap 沙箱层级。** 以放弃容器隔离换取容器内隔离——方向错误；`--security-opt seccomp=unconfined` 也无济于事。

**通过 CLI 旗标传入绑定。** `--host 0.0.0.0` 被设计性拒绝（`packages/bundle/web-app/src/startup.ts`）；profile patch 是受支持的通道，并让该拒绝对非容器使用继续有意义。

## Consequences

全新卷可离线启动，NousAI 界面由构建期断言保证。在沙箱决策落地之前，容器即安全边界——默认权限模式下 shell 工具以 `SANDBOX_UNAVAILABLE` 失败。默认值以 Podman 优先：Docker 下 `host.containers.internal` 需要覆盖或 `--add-host`（entrypoint 中已注明）。`/data` 下的种子文件仅在缺失时写入，因此用户对 patch、设置与会话的修改在重启与镜像重建后保留；删除 `webserver` patch 行的用户自行拥有由此产生的绑定。
