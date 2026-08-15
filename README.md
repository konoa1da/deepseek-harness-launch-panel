# launch-panel 🚀

DSH（DeepSeek Harness）Web GUI 插件：在 Web 界面右侧添加一个**可折叠的火箭发射任务面板**，汇总近一月已发射与即将发射的任务，悬停可查看中文富化的详情卡片。

## 功能特性

- **发射任务汇总** — 面板分「即将发射」与「已发射 · 近 30 天」两节展示任务列表（火箭型号、国家、日期、状态徽标）
- **悬停详情卡** — 鼠标悬停任意条目，浮层显示发射时间（北京时间 + UTC）、发射场、所属国家、目标轨道等详情
- **可折叠面板** — 默认收起为右侧竖排 `◀` 箭头，点击滑出；面板头部 `▶` 收起；开合状态持久化到 `localStorage`
- **数据自动刷新** — 每 5 分钟轮询一次，支持手动立即刷新（↻ 按钮），状态灯指示数据源在线/离线
- **完整监测页入口** — 面板底部可打开完整火箭监测页（`/launch-panel/page`，同源服务避免浏览器 `http → file://` 拦截）
- **离线兜底** — 所有数据源不可用时自动回退到内置演示数据，条目带「演示」标记

## 安装与使用

### 环境要求

| 项目 | 要求 |
| --- | --- |
| Node.js | ≥ 20.11（代码使用 `import.meta.dirname`） |
| DSH | Web profile（`dsh web`），插件通过 `webServer` 注入 + `__ModuleLoader__` 挂载 |
| 完整监测页 | 随 npm 包分发（包内 `assets/rocket-launch-monitor.html`），安装后即可打开；旧版布局（插件上级目录的同名文件）仍兼容 |

### 安装到 DSH Web profile

launch-panel 已发布到 npm（`launch-panel@0.1.1`），**一条命令即可安装**。以下以 Windows 默认路径 `%USERPROFILE%\.dsh\profiles\web` 为例。

> 前置条件：需要 `pnpm` 在 PATH 上（`npm install -g pnpm` 安装）。`dsh plugin` 命令会把参数转发给 profile 目录里的 pnpm。

**方式 A：一行命令安装（推荐）**

```sh
dsh plugin --profile web add launch-panel
```

这条命令会自动完成**全部安装步骤**，无需手动编辑任何文件：

1. 把 `launch-panel` 写入 profile 的 `package.json` 依赖并安装到 `node_modules`（等价于 pnpm add）
2. **自动登记**：安装后检测到 launch-panel 声明了 `dsh.bundle`，自动把它追加到 `dsh.profile.bundles` 层列表（`dsh plugin` 内置的 reconcile 机制）
3. 重启 Web GUI 生效：`dsh web`

以后升级版本同理：`dsh plugin --profile web update launch-panel`，然后重启 `dsh web`。

**方式 B：手动编辑 `package.json`（等价拆分，适合想看清每一步）**

在 `$DSH_HOME/profiles/web/package.json` 中做两处修改：

```jsonc
{
  "dependencies": {
    "launch-panel": "^0.1.0"                        // ① 从 npm 安装
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "launch-panel"                               // ② 加入 bundles 层
      ]
    }
  }
}
```

然后物化依赖并重启：

```sh
dsh plugin --profile web install
dsh web
```

**方式 C：本地 link 安装（备选，本地开发调试）**

适用于**本地开发调试**或不便访问 npm 的场景：将依赖指向本地 checkout，改代码即时生效，无需先发布新版本。

在 `$DSH_HOME/profiles/web/package.json` 中做两处修改：

```jsonc
{
  "dependencies": {
    "launch-panel": "link:F:/dsh/launch-panel"       // ① 依赖指向本地 checkout
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "launch-panel"                               // ② 加入 bundles 层
      ]
    }
  }
}
```

或使用等价命令（同样会自动登记 bundles）：

```sh
dsh plugin --profile web add "link:F:/dsh/launch-panel"
```

> 说明：`dsh.plugin.bundles` 中的登记是插件被组合挂载的前提；方式 A 和命令形式会自动处理，方式 B/C 手动编辑时需要自行加上。

### 验证是否安装成功

1. 打开 DSH Web GUI（默认 `http://127.0.0.1:3080`），页面**右侧边缘**出现竖排 `◀` 箭头；
2. 点击箭头，面板滑出并展示「即将发射 / 已发射 · 近 30 天」列表；
3. 浏览器或命令行访问 `http://127.0.0.1:3080/launch-panel/launches`，应返回 JSON（`previous` + `upcoming` 数组）；
4. 点击面板底部「🚀 打开完整火箭监测页」，可打开完整监测页（页面已随包分发，无需额外放置文件）。

### 使用说明

- 点击右侧 `◀` 箭头展开面板，点击面板头部 `▶` 收起；开合状态自动记忆（`localStorage`）
- 面板展开时每 5 分钟自动刷新，可点 `↻` 立即刷新；状态灯**蓝色**=数据源全部在线，**橙色**=部分/全部离线（回退演示数据）
- 悬停条目查看详情卡（发射时间、发射场、国家、轨道）；国内任务（CHN）条目带蓝色徽标
- 底部入口打开完整火箭监测页（同源 `/launch-panel/page`）

### 更新插件

- **npm 安装**：在 profile 目录执行 `dsh plugin --profile web update launch-panel`（等价于 pnpm update）或重新 `add` 新版本，然后重启 `dsh web` 生效
- **本地 link 开发**：改动代码后——
  - **Node half 改动**（`index.mjs`、`src/`）：重启 `dsh web` 生效
  - **client 改动**（`client/index.mjs`）：需先 `npm run build:client` 重新生成 bundle，再刷新浏览器页面（若在跑 dev watcher 则自动热重载）

## 架构

插件分服务端（Node half）与浏览器（client half）两部分：

```
launch-panel/
├── .dsh-plugin/
│   ├── index.mjs              # Node half：注册 webServer 路由（launches 代理 + page 服务）
│   ├── client.js              # client bundle 产物（生成文件，勿手改）
│   ├── client/
│   │   └── index.mjs          # client 源码：纯 DOM 自渲染、零依赖单文件
│   └── src/
│       ├── routes.mjs         # 路由前缀单一来源（client 与 Node half 共用）
│       ├── sources.mjs        # 发射数据源：LL2 → RLL → 演示数据（分节独立降级）
│       └── zh.mjs             # 中文富化：火箭/状态/轨道/发射场/国家 映射
├── assets/
│   └── rocket-launch-monitor.html  # 完整火箭监测页（随 npm 包分发，/launch-panel/page 读取）
├── scripts/
│   └── build-client.mjs       # 生成器：client/index.mjs → client.js（含 --check 校验）
├── cordis.patch.yml           # bundle patch：向 web 组合挂载本插件
└── package.json
```

## 许可

MIT
