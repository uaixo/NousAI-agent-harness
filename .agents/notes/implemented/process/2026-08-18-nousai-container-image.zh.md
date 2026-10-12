# Agent Note: NousAI container image

Status: implemented

[English](2026-08-18-nousai-container-image.md) | 中文

## Problem

部署 NousAI web 界面意味着复现一个可用的 monorepo checkout：构建 `lib/`、构建 NousAI 前端 dist，并安装一个 bundle 图中链接三个仅存在于本 fork 的 workspace 包的 web profile。其中两步在朴素做法下会静默失败——`dsh plugin install` 在没有 manifest 时会脚手架出一个*默认* profile 并以零退出码结束，产出一个看似健康的 DeepSeek 原版界面；而 nousai bundle 的 `workspace:^` 同级版本范围无法从 monorepo 之外的 profile 解析，首次启动因此死于找不到包。

## Decision

一个双阶段 OCI 镜像（`Dockerfile`、`docker/`）在 Podman 与 Docker 下以相同方式构建。构建阶段编译 workspace（先以 `build:native-system` 编译会话写锁所需的 flock 插件，再 `build:lib` + `build:web:nousai`），并将 profile bundle 图解析进 `/opt/dsh-seed` 的一次性 `DSH_HOME` 种子：profile manifest（`docker/profile-package.json`）在运行 `dsh plugin install` *之前*写入，使默认 profile 脚手架不可能发生；三个 fork 包全部显式链接（`link:/app/...`），因为 `workspace:^` 离开 workspace 后即失效。若任一 NousAI 包未链接进种子 profile，构建即失败——两种静默失败模式都被转换为响亮的构建失败。

构建上下文排除 `.git`，而 `build:lib` 的 Desktop 打包步骤在 `DSH_CLIENT_VERSION` 与 `DSH_CLIENT_COMMIT_HASH` 均未设置时会运行 `git rev-parse HEAD`，因此构建阶段以必需的构建参数接收源码 commit：`podman build --build-arg DSH_CLIENT_COMMIT_HASH="$(git rev-parse HEAD)" .`。参数缺失或为空时，构建在复制源码之前即停止；`scripts/client-build-environment.ts` 会拒绝不是 7 到 40 位十六进制 commit hash 的值。

运行阶段携带构建好的 `/app` 与种子。`docker/entrypoint.sh` 仅在 profile 缺失时把种子复制进挂载的 `/data` 卷，仅在 LM Studio provider 设置文件缺失时写入它，随后针对当前镜像重新链接 profile（失败时告警可见、启动继续），最后 exec `dsh web --host <网卡地址> --port 3080 --public-url $DSH_PUBLIC_URL --no-open`。`webserver` 配置在加载时拒绝一切通配绑定（`0.0.0.0`、`::`），因此 entrypoint 在每次启动时用 Node 解析容器自身的非环回 IPv4 网卡地址，因为引擎每次运行可能分配不同的地址；网络绑定带来的暴露风险通过仅发布到环回地址（`-p 127.0.0.1:3080:3080`）加以约束。`DSH_PUBLIC_URL`（默认 `http://127.0.0.1:3080/`，即文档中的发布映射）是打印的 URL、`DSH_WEB_URL` 与 web-surface 提示所公告的根。由 0.2.1-alpha.2 之前的镜像播种的卷带有绑定 `0.0.0.0` 的 `webserver` patch；entrypoint 在其文本仍为播种文本时删除该 patch，对已被修改的 patch 则不予触碰，后者随后在加载时响亮失败。在启用 SELinux 的宿主上（包括 `podman machine` 背后的 Fedora CoreOS 虚拟机）卷挂载需要 `:Z`；缺少它时，复用同一卷的第二个容器会获得不同的 MCS 类别，种子复制死于 `Permission denied`。

镜像携带包含 devDependencies 的完整 workspace：dsh 从自身安装树解析 profile bundle，`dsh plugin install` 又会调用 pnpm，两者都无法在裁剪后存活。构建上下文排除根目录 `.env`——`DEEPSEEK_API_KEY` 的文档化存放处——使 `COPY . .` 不可能把凭据烤进镜像。

## Sandbox posture

在 rootless 容器中，两级 Linux 沙箱都不可用：bwrap 无法创建嵌套用户命名空间；Landlock 启动器二进制是 release 工作流的预构建产物、`pnpm install` 不会产出，因此即使内核支持 Landlock（实测 ABI 9），功能探测也报告 `unusable`。启动与模型轮次不受影响；shell 命令会抛出 `SANDBOX_UNAVAILABLE`。部署方要么设置 `DSH_PERMISSION_MODE=danger-full-access` 并把容器本身当作边界，要么增加一个运行 `native/system` `build:native` 的构建阶段。镜像中刻意不解决：这是安全姿态决策，不是构建细节。重新引入条件：一旦确定容器内沙箱立场，即添加启动器构建阶段（或预构建拉取）并删除本段。

## Alternatives considered

**在首次启动时解析 bundle 图，而非构建期。** 容器启动时需要网络与 registry，且每个全新卷都会重新打开默认 profile 脚手架陷阱。构建期种子可离线启动，并在镜像构建时一次性断言。

**裁剪 devDependencies 以缩小运行镜像。** dsh 从自身安装树解析 profile bundle，`dsh plugin install` 又调用 pnpm；裁剪会同时破坏两者。体积代价换来的是一个能重新链接并扩展自身 profile 的运行时。

**用 `--privileged` 恢复 bwrap 沙箱层级。** 以放弃容器隔离换取容器内隔离——方向错误；`--security-opt seccomp=unconfined` 也无济于事。

**用 profile patch 播种 `webserver` 绑定。** 0.2.1-alpha.2 之前的镜像以 `host: '0.0.0.0'` 这样做，这是无需知道容器地址就能触达所有接口的唯一写法。schema 自 0.2.1-alpha.1 起拒绝一切通配地址，而一次性写入卷中的具体地址会在引擎为下一次运行分配不同地址时失效；读取环境变量的 `!!js` 表达式能保持地址最新，却把一个每次启动都变化的值放进了用户拥有的文件。

**在构建上下文中包含 `.git`。** 构建命令可保持为 `podman build .`，但每次构建上下文都会加入完整的 Git 历史；而 `git worktree` 创建的 checkout 中 `.git` 是指向上下文之外的文件，其构建仍会失败。

**改为在构建步骤中设置 `DSH_CLIENT_VERSION`。** 这样 Desktop 打包步骤会跳过 Git，普通的 `podman build .` 即可工作；但客户端 bundle 会嵌入版本号，使通用设置显示当前版本行，且镜像不记录 commit。

## Consequences

全新卷可离线启动，NousAI 界面由构建期断言保证。在沙箱决策落地之前，容器即安全边界——默认权限模式下 shell 工具以 `SANDBOX_UNAVAILABLE` 失败。默认值以 Podman 优先：Docker 下 `host.containers.internal` 需要覆盖或 `--add-host`（entrypoint 中已注明）。`/data` 下的种子文件仅在缺失时写入，因此用户对设置文件与会话的修改在重启与镜像重建后保留；绑定与公告根随镜像的 entrypoint 一起更新，`DSH_PUBLIC_URL` 是唯一的部署旋钮。
