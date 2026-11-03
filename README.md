# 绝缘舱 ArcAtely——一个不怕电的建模社区

基于 Next.js 14 App Router、TypeScript、Tailwind CSS、shadcn/ui、Prisma、PostgreSQL、NextAuth、Redis、Meilisearch、S3 与 PWA 的可运行项目。包含前台社区、完整互动、发布审核和治理后台。

## 已实现

- 首页推荐/最新/热门、搜索与多条件筛选、搜索历史、热门搜索、日/周/月/总排行。
- 模型发布/编辑/软删除、封面和模型上传、外链、分类、可见性、自定义标签、敏感词与重复校验。
- 点赞、收藏、浏览历史、关注、作者/标签订阅、评论、分享、举报、通知。
- 私信会话、轮询更新、未读、拉黑、骚扰举报与限流。
- 个人资料、我的发布/收藏/历史、关注/粉丝、举报记录、账号设置。
- 后台模型批量管理、审核队列、举报申诉、用户认证/角色/封禁禁言、标签/分类/评论/合集、敏感词、系统设置。
- DAU/MAU、发布/审核/举报/互动统计、平均处理时长、CSV 导出、审计日志、数据库备份恢复、健康检查。
- 响应式、键盘焦点、语义化 HTML、详情 SEO/OG/JSON-LD、Sitemap、PWA 离线缓存/更新/弱网提示。
- Docker Compose 与 Vercel 配置。上传、搜索、限流均有本地降级，方便开发。

架构、路由、API、权限矩阵和增强项见 [`docs/architecture.md`](docs/architecture.md)。

## 快速启动（本地）

前置：Node.js 20+，PostgreSQL 16。Redis、Meilisearch 和 S3 可选。

```bash
npm install
cp .env.example .env
# 修改 .env 中 NEXTAUTH_SECRET，并确认 DATABASE_URL
npm run db:push
npm run db:seed
npm run dev
```

访问 http://localhost:3000。演示账号密码均为 `Demo123456`：

| 角色 | 邮箱 |
|---|---|
| 超级管理员 | `admin@modelhub.local` |
| 审核员 | `reviewer@modelhub.local` |
| 作者 | `maker@modelhub.local` |
| 普通用户 | `user@modelhub.local` |

后台：http://localhost:3000/admin/dashboard。演示数据包含 6 个模型，其中“窗边绿植”处于待审核状态，可完整验收审核流程。

## Docker 启动

```bash
cp .env.example .env
# 生成并写入强 NEXTAUTH_SECRET
docker compose up --build -d postgres redis meilisearch minio
# 首次启动可先在宿主机执行数据库初始化，或进入应用容器执行
npm run db:push && npm run db:seed
docker compose up --build -d app
```

MinIO 控制台为 http://localhost:9001（开发账号 modelhub / modelhub123），首次使用需创建 `modelhub` Bucket，并按部署环境配置访问策略和 CORS。不要在生产沿用示例口令。

也可以使用 `docker compose up --build` 一次启动，再在 app 容器运行 `npx prisma db push && npx prisma db seed`。生产建议使用 `prisma migrate deploy`，先执行 `npm run db:migrate` 生成迁移文件。

## 常用命令

```bash
npm run dev          # 开发
npm run typecheck    # TypeScript 严格检查
npm run lint         # Next.js ESLint
npm test             # 核心校验单元测试
npm run build        # Prisma Client + 生产构建
npm start            # 生产服务
npm run db:studio    # 数据库可视化
npm run backup       # 手动数据库备份，需要 pg_dump
```

## 服务降级与生产要求

| 服务 | 未配置时 | 生产建议 |
|---|---|---|
| Meilisearch | PostgreSQL 条件搜索 | 启用 Meilisearch；中文规模检索配置分词 |
| Redis | 进程内限流 | 多实例必须启用 Redis |
| S3 | `public/uploads` 本地文件 | Vercel/多实例必须启用 S3 |
| 备份 | 本机 `pg_dump` 到 `backups/` | 容器持久卷 + 远程异机备份；同时备份对象存储 |

未配置 Meilisearch 时 API 明确返回 `engine: database`；不是静默伪装搜索服务。本地降级不适合多实例生产。

## Vercel 部署

Vercel 是无状态 Serverless 环境，与 Docker 部署有三点关键差异：

- 上传文件必须进入 S3，不能写入本地磁盘。
- Vercel Function 请求体上限为 **4.5 MB**。本项目已支持浏览器通过预签名 POST 直传 S3，模型文件不会经过 Function。
- `/api/admin/backup` 依赖 `pg_dump` 和持久磁盘，**不能在 Vercel 上执行**；请使用 Supabase 自动备份或外部定时任务。

### 1. 准备外部服务

| 服务 | 是否必需 | 推荐 |
|---|---|---|
| PostgreSQL | 必需 | Supabase |
| S3 兼容对象存储 | 必需 | AWS S3、Cloudflare R2、Backblaze B2 |
| Redis | 生产推荐 | Upstash Redis |
| Meilisearch | 可选 | Meilisearch Cloud；未配置时搜索 API 会降级到数据库 |
| 域名（可选） | 推荐 | 自有域名绑定 Vercel |

### 2. 初始化 Supabase

1. 创建 Supabase 项目，进入 **Project Settings → Database → Connection string**。
2. 复制 **Session pooler（5432）**，用于本地执行 Prisma 建表。
3. 在本地 `.env` 临时设置该 Session pooler 地址，然后执行：

```bash
npm ci
npx prisma db push
# 生产演示数据可选；执行前务必设置强密码
# PowerShell: $env:SEED_PASSWORD="强密码"; npm run db:seed
npm run db:seed
```

4. 部署到 Vercel 时，运行时 `DATABASE_URL` 改用 **Transaction pooler（6543）**：

```env
DATABASE_URL="postgresql://postgres.项目ID:数据库密码@aws-0-区域.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

5. 以后修改 Prisma schema 时，本地临时换回 Session pooler 执行 `npx prisma db push`，再恢复 Vercel 的 Transaction pooler 配置。不要用 6543 端口执行建表命令。
6. 生产种子必须设置强密码，禁止使用默认演示密码：

```powershell
$env:SEED_PASSWORD="一个足够长的随机密码"
npm run db:seed
```

### 3. 配置 S3 与 CORS

当前项目上传后返回公开文件 URL，因此 MVP 请将 Bucket 配置为**公共读取**；私有 Bucket 需要另行实现签名下载。

```env
S3_ENDPOINT="https://你的账号.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="modelhub"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL="https://files.example.com"
S3_FORCE_PATH_STYLE="true"
```

- AWS S3 可删除 `S3_ENDPOINT`，并设置 `S3_FORCE_PATH_STYLE="false"`。
- R2/MinIO 通常使用 `S3_FORCE_PATH_STYLE="true"`。
- `S3_PUBLIC_URL` 必须是浏览器可直接访问的公开域名，末尾不要加 `/`。
- 为 Bucket 配置 CORS，允许正式域名和本地开发域名：

```json
[
  {
    "AllowedOrigins": ["https://你的域名.com", "http://localhost:3000"],
    "AllowedMethods": ["POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 300
  }
]
```

浏览器会直接向 S3 发起 `multipart/form-data POST`。如果出现“对象存储直传失败”，优先检查 Bucket CORS、`S3_PUBLIC_URL` 和预签名接口返回的 endpoint。

### 4. 配置 Redis 与 Meilisearch（可选）

```env
REDIS_URL="rediss://default:密码@你的实例.upstash.io:6379"
MEILISEARCH_HOST="https://你的实例.meilisearch.io"
MEILISEARCH_API_KEY="服务端搜索密钥"
```

Vercel 多实例环境中，进程内限流无法共享，正式上线必须配置 Redis。Meilisearch 未配置不会阻止部署，但搜索会回退为 PostgreSQL 查询。

### 5. 导入 Vercel

1. 将项目推送到 GitHub/GitLab，确认 `.env` 未被提交。
2. Vercel 选择 **Add New → Project → Import**，Framework 选择 Next.js，Root Directory 保持项目根目录。
3. Build Command 使用 `npm run build`，Install Command 使用 `npm ci`。
4. 在 **Settings → Environment Variables → Production** 添加：

```env
DATABASE_URL=Supabase Transaction pooler（6543）
NEXTAUTH_URL=https://你的正式域名
NEXTAUTH_SECRET=至少32位随机字符串
NEXT_PUBLIC_SITE_URL=https://你的正式域名
REDIS_URL=...
MEILISEARCH_HOST=...
MEILISEARCH_API_KEY=...
S3_ENDPOINT=...
S3_REGION=...
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=...
S3_FORCE_PATH_STYLE=true
```

5. 点击 **Deploy**。部署完成后打开 `https://你的域名/api/health`，应返回 `status: healthy`，并显示 `storage: s3`、`cache: configured`。
6. Preview 部署使用临时域名，通常无法完成正式登录；请以 Production 域名验收。不要在预览环境使用生产数据库执行写操作。

### 6. 绑定域名

1. Vercel → **Settings → Domains** 添加域名，按提示配置 DNS。
2. 将 `NEXTAUTH_URL` 和 `NEXT_PUBLIC_SITE_URL` 更新为最终 HTTPS 域名。
3. 重新部署，确保登录回调、分享链接、Sitemap 和 OG 卡片都使用正式域名。
4. 在 S3 CORS 中加入最终域名。

### 7. 首次上线验收

- 打开 `/api/health`，确认数据库、缓存和存储状态。
- 注册普通用户并登录。
- 上传一个大于 5 MB 的模型文件，确认浏览器直传 S3 成功。
- 发布模型 → 审核员通过 → 首页和搜索中可见。
- 检查图片是否能通过 `S3_PUBLIC_URL` 打开。
- 测试举报、通知和后台审核。
- 用超管账号访问 `/admin/dashboard`。

### 8. Vercel 上的备份策略

不要调用后台的数据库备份按钮。推荐方案：

- Supabase 控制台开启自动备份/时间点恢复（以当前套餐为准）。
- 使用 GitHub Actions 定时 `pg_dump` 到 S3，并开启 Bucket 版本控制。
- 每月至少做一次恢复演练。
- 上传附件依靠 S3 版本控制或跨区域复制，`public/uploads` 在 Vercel 上不会被持久保存。

### 常见错误

| 错误 | 处理 |
|---|---|
| `P1001 Can't reach database server` | 检查 Supabase 主机名是否为真实区域代码，Vercel 运行时使用 6543 |
| `P1000 authentication failed` | 检查数据库密码和 URL 编码 |
| `413 FUNCTION_PAYLOAD_TOO_LARGE` | 确认未配置 S3，或旧版上传入口仍经过 Function |
| 图片 404 | 检查 `S3_PUBLIC_URL`、Bucket 公共读取策略 |
| 上传 CORS 错误 | 将正式域名加入 Bucket CORS，允许 POST |
| 登录成功后又回登录页 | 核对 `NEXTAUTH_URL`、HTTPS 和域名是否完全一致 |
| 搜索慢 | 配置 Meilisearch，或将 Vercel Function 区域设到数据库附近 |

> `vercel.json` 当前指定 `hkg1` 区域；如果账号套餐不支持该区域，删除 `regions` 字段或在 Vercel 支持的区域中选择离 Supabase 最近的节点。

## 备份与恢复

```bash
npm run backup
# Linux cron 示例：每天 02:30
30 2 * * * cd /srv/modelhub && /usr/bin/npm run backup >> backup.log 2>&1
```

超管也可在“后台 → 备份与维护”创建备份。恢复需要再次输入 `RESTORE`，会覆盖当前数据库；请先在隔离环境验证备份。附件备份应使用 S3 版本控制/跨区复制，本地部署则同步持久卷。

## 安全说明

- NextAuth JWT 会话、bcrypt 密码哈希；所有管理接口在服务端重新校验角色。
- 作者资源归属校验；封禁禁止登录，禁言限制发布、评论与私信。
- React 默认转义 + 文本清理；Prisma 参数化查询；同源 Origin/Sec-Fetch-Site 校验与 NextAuth CSRF。
- 文件扩展名、MIME、大小、文件名和随机存储键校验；上传和互动接口限流。
- 敏感词、审核、举报、申诉、私信拉黑、通知与关键操作审计。
- 安全响应头、管理/个人页面 noindex、外链 `noopener/noreferrer`、JSON-LD 防标签闭合。

上线前仍需：替换演示口令、配置 HTTPS/HSTS、S3 私有桶与签名下载、病毒扫描、邮件验证/找回密码、真实法律文本、数据库迁移和恢复演练。

## 验收清单

详细步骤见 [`docs/acceptance.md`](docs/acceptance.md)。最低验收路径：注册 → 搜索/标签 → 详情点赞收藏关注 → 发布模型 → 审核员通过 → 首页可见 → 举报 → 后台处置 → 用户收到通知 → 超管统计与备份。

## MVP 后续增强

WebSocket 私信、浏览器推送、邮件验证、合集前台完整编辑器、附件打包备份、精细化事件留存分析、模型文件病毒扫描与异步转码。这些不影响当前指定 MVP 的核心流程。
