# 发布到 GitHub

仓库已 `git init` 并完成首次提交（`eb4c3c1`，59 文件）。本机没有 GitHub 凭据，最后一步需要你操作。

---

## 方式一：GitHub 网页（最简单）

1. 打开 https://github.com/new
2. Repository name 填 `design-system`（或 `hosa-design-system`）
3. **不要**勾选 "Add a README file"（本地已有）
4. Create repository
5. 在仓库页面点 **"uploading an existing file"** → 拖入 `hosa-design-system-v1.0.0.zip` 的**解压内容**（或用下面的命令）

> ⚠️ 网页上传不支持文件夹结构，PNG 和嵌套目录会比较麻烦。**推荐用方式二**。

---

## 方式二：命令行（推荐）

### 1. 在 GitHub 上建空仓库

打开 https://github.com/new，建一个空仓库（不要初始化 README）。

假设仓库地址是 `https://github.com/<你的账号>/design-system.git`

### 2. 推送

```bash
cd hosa-design-system

# 关联远端
git remote add origin https://github.com/<你的账号>/design-system.git

# 推送
git push -u origin main
```

推送时 GitHub 会要求登录。推荐用 **Personal Access Token** 而非密码：

- GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
- 勾选 `repo` 权限，生成后复制 token
- 推送时用户名填 GitHub 账号，密码粘贴 token

### 3. 打 tag（可选，用于 Release）

```bash
git tag -a v1.0.0 -m "设计系统 v1.0.0"
git push origin v1.0.0
```

然后在仓库 Releases 页可以挂 `hosa-design-system-v1.0.0.zip` 作为下载附件。

---

## 方式三：gh CLI（如果有）

```bash
gh auth login
cd hosa-design-system
gh repo create design-system --public --source=. --remote=origin --push
```

---

## 发布后的 Skill 集成方式

### Claude Code / WorkBuddy / Codex 等

```bash
git clone https://github.com/<你的账号>/design-system.git ~/.workbuddy/skills/hosa-design-system
```

装到 `~/.workbuddy/skills/` 后，Agent 会自动识别 `SKILL.md` 并在相关任务时加载。

**也可以直接下载 zip 解压到该目录** —— 目录结构已按 Skill 规范组织：
```
hosa-design-system/
├── SKILL.md        ← Agent 入口（带 frontmatter）
├── references/     ← 按需加载的详细规范
├── assets/         ← Token / 组件 / 素材 / 模板
└── scripts/        ← 构建与校验脚本
```

### 其他 Agent 平台

| 平台 | 安装位置 |
| --- | --- |
| Claude Code | `~/.claude/skills/` |
| Cursor | `.cursor/rules/` 或 `~/.cursor/rules/` |
| Windsurf | `~/.codeium/windsurf/rules/` |
| 通用 | 直接把 `SKILL.md` + `references/` 喂给 AI 当系统提示 |

---

## 验证发布是否正确

```bash
# clone 下来后
cd design-system

# Token 产物是否同步
node scripts/build-tokens.mjs && git diff --exit-code -- assets/tokens/

# 对比度是否达标
node scripts/check-contrast.mjs

# 安装到临时项目并真实渲染验证
node scripts/verify-e2e.mjs
```

---

## 仓库已配置的 CI

`.github/workflows/ci.yml` 会在 push / PR 时自动跑三道关：

| Job | 检查 |
| --- | --- |
| `validate` | Token 产物与 source.json 同步、对比度达标、Figma Token 同步 |
| `typecheck` | 组件 TypeScript 类型检查 |
| `install-test` | 安装脚本冒烟测试（dry-run + 实际安装 + 产物齐全性） |

任何一项不过，PR 无法合并。

---

## 后续发版

```bash
# 1. 改 assets/tokens/source.json
# 2. 重建产物
node scripts/build-tokens.mjs
node scripts/check-contrast.mjs
node scripts/build-figma-tokens.mjs
# 3. 提交
git add -A && git commit -m "chore: 同步 token 产物"
git push
```

**注意**：`assets/tokens/` 下除 `source.json` 和 `contrast-report.md` 外都是生成物，不要手工编辑——CI 会检出不同步并失败。
