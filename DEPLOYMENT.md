# 线上部署记录

## 当前进度（2026-10-05）

用户要求部署整个旅游产品。暂选 Railway 作为现有 Node.js 24 + SQLite 架构的托管候选；平台尚未登录，未创建线上资源，未产生可访问的线上地址。GitHub 源码仓库保持私有。

## 部署设置

使用仓库根目录 Dockerfile 构建，运行一个实例。网页和 API 由同一个服务提供。

| 配置 | 值 |
| --- | --- |
| 仓库 | nexorithium/travel-product |
| 分支 | main |
| HOST | 0.0.0.0 |
| DATABASE_PATH | /app/data/travel.sqlite |
| 持久化卷挂载路径 | /app/data |
| COOKIE_SECURE | true |
| APP_ORIGIN | 平台实际生成的 HTTPS 地址，不含末尾斜线 |
| 健康检查路径 | /api/health |
| 实例数 | 1 |

PORT 由平台设置；Docker 健康检查跟随该端口。Railway 的卷可能由 root 所有，当前镜像使用 node 用户；按官方卷说明设置 RAILWAY_RUN_UID=0 后检查数据库可写。此平台设置不修改本地 Docker 默认用户。

后台规划任务在进程内运行，服务不能在任务执行期间休眠。卷保证记录跨部署保留，正在执行的任务重启后会失败，需要重新发起。

模型和地图服务配置在托管平台的服务端环境变量中填写，禁止上传真实 .env 或在聊天中提供密钥：MODEL_API_KEY、MODEL_NAME、MODEL_BASE_URL、MODEL_PROTOCOL、AMAP_WEB_KEY；TAVILY_API_KEY 可选。缺少必填服务配置时，网页仍可访问示例，真实 AI 返回服务待配置。健康检查 status=ok 只代表服务存活，ready=true 才表示必填配置齐备；真实请求仍需另行验收。

## 上线验收

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

