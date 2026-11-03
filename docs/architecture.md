# 模型分享网：架构与交付边界

## 1. 项目结构

- `app/`：Next.js App Router 页面和 REST API；后台复用 `/admin/*`。
- `components/`：shadcn/ui 基础组件、模型卡片、互动组件、后台表格。
- `lib/`：Prisma、NextAuth、RBAC、搜索、对象存储、限流、审计、内容安全。
- `prisma/schema.prisma`：完整关系数据模型；`prisma/seed.ts`：演示与测试账号。
- `public/`：PWA 图标、离线页资源、本地上传目录。
- `scripts/backup.ts`：数据库备份入口；`docs/`：架构、API 和验收文档。
- `docker-compose.yml`：PostgreSQL、Redis、Meilisearch、MinIO 与应用。

## 2. 页面路由

| 路由 | 功能 |
|---|---|
| `/` | 推荐/最新/热门模型流、搜索、标签、作者、公告 |
| `/search` | 关键词、标签、分类、时间、热度/点赞/收藏筛选，历史与热门搜索 |
| `/rankings` | 日/周/月/总榜，热度/浏览/点赞/收藏/作者贡献 |
| `/models/[id]` | 模型详情、下载/外链、点赞收藏分享、评论、举报、相关推荐 |
| `/models/new`、`/models/[id]/edit` | 发布与编辑，上传封面/文件或填写外链 |
| `/tags`、`/tags/[slug]` | 热门标签、标签详情与筛选 |
| `/collections`、`/collections/[id]` | 合集/专题列表、详情与订阅 |
| `/subscriptions` | 作者/标签/合集订阅及个性化更新 |
| `/u/[id]` | 用户主页、作者作品、关注 |
| `/me/[section]` | 资料、发布、收藏、历史、关注/粉丝、举报、设置 |
| `/messages`、`/notifications` | 私信会话/未读与通知 |
| `/admin/[section]` | 概览、内容、审核、举报、标签、用户、设置、日志、备份 |
| `/login`、`/register` | 凭据登录注册 |
| `/privacy`、`/terms`、`/offline` | 合规与 PWA 离线页 |

## 3. API 清单

| 方法与路径 | 权限 | 用途 |
|---|---|---|
| `POST /api/auth/register`、`ALL /api/auth/[...nextauth]` | 公开 | 注册、登录、退出 |
| `GET/POST /api/models`、`GET/PATCH/DELETE /api/models/[id]` | 公开/登录/作者 | 模型列表、发布、详情、编辑、删除 |
| `POST/DELETE /api/models/[id]/like|favorite|history` | 登录 | 点赞、收藏、浏览历史 |
| `GET/POST /api/models/[id]/comments` | 公开/登录 | 评论互动 |
| `POST /api/models/[id]/report` | 登录 | 举报 |
| `GET /api/models/[id]/share` | 公开 | 分享统计信息 |
| `POST/DELETE /api/users/[id]/follow` | 登录 | 关注作者 |
| `GET /api/search`、`GET/POST/DELETE /api/search/history` | 公开/登录 | 搜索与历史 |
| `GET/POST /api/tags` | 公开/登录 | 标签列表、自定义标签 |
| `POST /api/upload` | 登录 | 图片/模型上传（本地或 S3 服务端上传） |
| `POST /api/upload/presign` | 登录 | 获取 S3 POST 直传策略，绕过 Vercel 4.5MB 函数请求限制 |
| `GET/POST /api/messages`、`GET/PATCH /api/messages/[id]` | 登录 | 私信轮询、会话已读/拉黑 |
| `GET/PATCH /api/notifications` | 登录 | 通知及全部已读 |
| `GET/POST/DELETE /api/subscriptions` | 登录 | 订阅管理 |
| `PATCH /api/admin/models/[id]` | 管理员 | 推荐、置顶、下架 |
| `POST /api/admin/moderation/[id]` | 审核员 | 通过/驳回/恢复 |
| `POST /api/admin/reports/[id]` | 审核员 | 举报处理与申诉 |
| `PATCH /api/admin/users/[id]` | 管理员 | 认证、角色、禁言/封禁 |
| `PATCH/DELETE /api/admin/tags/[id]` | 管理员 | 标签治理 |
| `GET/PUT /api/admin/settings` | 超管 | 系统设置 |
| `GET/POST /api/admin/backup`、`POST /api/admin/backup/[id]/restore` | 超管 | 备份列表/创建/受控恢复 |
| `POST /api/admin/cache` | 超管 | 缓存清理 |
| `GET /api/health` | 公开 | 健康检查（不暴露秘密） |

## 4. 权限矩阵

| 能力 | 游客 | 用户 | 作者 | 审核员 | 管理员 | 超管 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| 浏览/搜索/排行/详情 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 发布/互动/私信/举报 | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| 管理自己的模型 | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| 审核与举报处理 | — | — | — | ✓ | ✓ | ✓ |
| 内容/标签/用户治理 | — | — | — | 部分 | ✓ | ✓ |
| 角色与系统设置 | — | — | — | — | 限角色 | ✓ |
| 备份恢复/缓存维护 | — | — | — | — | — | ✓ |

作者不是独立硬门槛：注册用户发布后即具备自己作品的作者权限，`AUTHOR` 角色用于作者标识/认证运营。所有 API 均在服务端校验 session、资源和角色；封禁禁止登录，禁言禁止发布、评论、私信。

## 5. MVP 范围与增强项

本仓库完整覆盖指定 MVP：搜索、响应式、发布与审核、标签、收藏、历史、点赞、关注、举报、后台内容管理、审核中心、基础统计、数据库备份；同时包含注册登录、排行、订阅、评论、私信轮询、通知、审计、PWA 和 Docker。

推送通知、WebSocket 私信、附件打包备份与跨实例分布式定时任务属于后续增强。Vercel 为只读/临时文件系统，因此生产必须启用 S3；备份需改用外部 cron 调用受保护 API，或迁移到具备持久磁盘的容器主机。数据库降级搜索适用于小规模中文关键词；生产中文检索建议为 Meilisearch 配置中文分词或引入 PostgreSQL `pg_jieba`。
