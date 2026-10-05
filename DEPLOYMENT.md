# 线上部署记录

## 当前进度（2026-10-05）

网页、Node.js 后台和 SQLite 持久化存储已部署到 Railway，并通过线上检查。

- 正式访问地址：https://travel-product-production.up.railway.app
- 项目：agile-youthfulness，ID `6b8ed237-aba3-41e7-a2d6-e27f6f83b949`
- production 环境：`087e7ce1-1838-495b-bc1e-4cf326bb9cd7`
- 服务 travel-product：`c9ec983d-b7aa-4b40-964c-0eef0fe181c9`
- 持久化卷 travel-product-volume：`2527aff6-44a5-49a6-9b25-3ae52a22bc4f`
- 首次成功部署：`2baadce8-d7ea-4c24-a917-a89a8e86a0ea`；持久化验收重新部署：`0e5e7dca-4bf0-4aa1-b5dc-26287b7d319a`。
- 运行代码提交：`cb6599e`。后台与网页同时由 Node.js 24 镜像运行。

模型与高德服务尚未配置，真实 AI 未通过端到端验收；页面明确展示待配置，示例仍可使用。当前使用 Trial，登录时显示剩余 30 天／$5 额度，未开通付费订阅。自动备份尚未设置。

GitHub 仓库已转移至 Nexorune/travel-product；2026-10-05 API 核查当前为公开，与最初选择私有的记录不同，本轮未修改可见性。

## 部署设置

使用仓库根目录 Dockerfile 构建，运行一个实例。网页和 API 由同一个服务提供。

| 配置 | 值 |
| --- | --- |
| 仓库 | Nexorune/travel-product |
| 分支 | main |
| HOST | 0.0.0.0 |
| DATABASE_PATH | /app/data/travel.sqlite |
| 持久化卷挂载路径 | /app/data |
| COOKIE_SECURE | true |
| APP_ORIGIN | https://travel-product-production.up.railway.app |
| 健康检查路径 | /api/health |
| 实例数 | 1 |

服务端 PORT 显式设置为 17887，平台域名目标端口与其一致；Docker 健康检查跟随 PORT。Railway 的卷由平台挂载，镜像不能包含 VOLUME 声明，已删除该声明。本地仍用显式 -v 持久化。按官方卷说明设置 RAILWAY_RUN_UID=0，已实际核查 /app/data 为挂载点且数据库可写。此平台设置不修改本地 Docker 默认用户。

后台规划任务在进程内运行，服务不能在任务执行期间休眠。卷保证记录跨部署保留，正在执行的任务重启后会失败，需要重新发起。

模型和地图服务配置在托管平台的服务端环境变量中填写，禁止上传真实 .env 或在聊天中提供密钥：MODEL_API_KEY、MODEL_NAME、MODEL_BASE_URL、MODEL_PROTOCOL、AMAP_WEB_KEY；TAVILY_API_KEY 可选。缺少必填服务配置时，网页仍可访问示例，真实 AI 返回服务待配置。健康检查 status=ok 只代表服务存活，ready=true 才表示必填配置齐备；真实请求仍需另行验收。

## 上线验收

本次结果：平台镜像构建成功，线上 /api/health 返回 HTTP 200、status=ok、ready=false；首页和 /api/trips 返回 200；匿名 cookie 为 HttpOnly、Secure、SameSite=Strict；外部来源的修改返回 403，本产品同源空测试会话清除成功。

390×844 手机视口已核查首页、两条条件采集入口、示例行程及锁定操作、设置页的真实待配置状态。截图见 artifacts/online-home-20261005.png 和 artifacts/online-trip-20261005.png。

持久化实测：在独立 deployment_check 记录中写入标记，通过平台重新部署到新的 deployment 和 container instance 后，从同一 SQLite 读取成功，随后仅删除该测试记录。未写入或修改用户行程。此验证只证明数据库跨部署保留，不替代真实 AI 行程验收。

后续配置服务后继续检查：

1. 平台构建成功，服务健康，获得实际 HTTPS 地址。
2. 手机布局正常，未知/已知目的地双入口与示例可打开。
3. API 返回 Secure 会话 cookie；同源修改能成功，其他来源被拒绝。
4. 测试记录写入后重新部署，检查记录仍存在；不能只验证首页。
5. 供应商配置完成后，验收两条真实规划入口、地点与路线查询、调整提案及确认保存。
6. 记录线上地址、平台项目/服务标识、费用方案和备份配置到 PROJECT_MEMORY.md。

## 平台费用

2026-10-05 核查：Railway 新账号试用提供一次性 $5 额度，限 30 天；Hobby 为每月 $5，包含 $5 用量，超额另计。登录后以账号实际额度为准；没有确认付费授权时不订阅付费计划。试用到期后的卷有数据保留期限，试用不等于长期免费生产托管。

官方资料：

- https://docs.railway.com/pricing/free-trial
- https://docs.railway.com/pricing/plans
- https://docs.railway.com/volumes/reference

## 后续更新

部署时 Source 页面显示 Auto deploy unavailable、Could not load branches。本轮通过 Upstream Repo 的 Check for updates → Update 拉取提交，并用 Deploy Changes 应用设置；不要默认 GitHub 推送一定自动更新线上。新版本在部署完成后核查实际提交、健康状态和页面。
