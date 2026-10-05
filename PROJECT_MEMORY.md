
## 2026-10-02 预览端口修复
- 此项目是旅游规划产品，手机网页版、未知/已知目的地双入口。
- 已确认 UI 参考 Fora 视觉、Mindtrip 探索、Tripsy 行程卡片；配色雾蓝＋冷白。
- 旧预览 http://127.0.0.1:8787/ 已被悦读阅读项目使用，不能再作为旅游链接。
- 旅游服务默认端口改为 17887，Vite API 代理、配置示例、Docker 与 README 已同步。
- 本机预览 http://127.0.0.1:17887/，启动 npm start；端口变化后需检查网页标题与 /api/health 才给预览链接。
- 真实 AI 服务待配置，使用可配置接入层。
- 修复验收：npm ci 恢复已缺失的依赖；build/lint 通过。HTTP 断言标题包含旅游产品且 /api/health.status=ok；浏览器看到旅行计划、目的地双入口。已打开 Codex 预览。

## 2026-10-02 GitHub 上传
用户授权将旅游项目所有文件打包上传 GitHub；目标已登录账号 nexorithium，新仓库 travel-product。归档源码、配置、截图、测试与构建产物；排除实际密钥、本机 SQLite 数据、node_modules、缓存。依赖可由 package-lock.json 恢复。
- 可见性未指定时采用私有仓库；仓库 https://github.com/nexorithium/travel-product ，发行版 https://github.com/nexorithium/travel-product/releases/tag/v0.3.0 。归档版本 v0.3.0 为开发版，AI 待配置，非线上发布。

## 2026-10-04 本地预览
- 用户明确要求打开产品网页预览并启动本地项目。
- 使用现有 dist 与依赖启动服务，http://127.0.0.1:17887/；健康接口正常，浏览器确认标题“旅游产品 · 规划下一段旅程”、旅行计划与目的地双入口。
- 已在 Codex 打开预览；模型与高德配置仍缺失，界面和示例可体验。

## 2026-10-05 部署上线
- 用户明确要求把现有旅游产品部署上线，包含网页、后台及数据保存。
- 正在核查 Railway，Ego 浏览器 TaskSpace 63（旅游产品上线部署）停在登录页；平台尚未登录，不存在已确认的线上地址。
- 现有架构需 Node.js 24、一个实例和持久化卷 /app/data；HTTPS 使用 COOKIE_SECURE=true 和实际 APP_ORIGIN。模型与高德密钥仍待配置。
- Docker 健康检查已改为跟随平台 PORT，部署设置记录在 DEPLOYMENT.md。当前机器没有 Docker，尚未执行镜像构建；平台构建及线上验收待登录后继续。
- 不把静态首页发布当作完整产品上线，不擅自订阅付费套餐。
- 本轮验证：生产构建通过；使用随机端口启动隔离的内存数据库服务，执行 Dockerfile 中的实际健康检查表达式，退出码 0；health.status=ok、ready=false。
- GitHub 推送前发现远端新增 README 修改，已整合并保留“旅途”名称及说明删改。推送提示仓库移至 https://github.com/Nexorune/travel-product ，已通过 GitHub API 核实并更新 origin；当前 isPrivate=false，与最初选择私有不同，本轮未改变仓库可见性。

### 用户完成登录后上线成功
- 线上地址 https://travel-product-production.up.railway.app ，网页、后台、数据库均已部署；不是临时本机链接。
- Railway workspace af6b27b7-4229-427c-b2c2-18d6ef11d25e；项目 agile-youthfulness / 6b8ed237-aba3-41e7-a2d6-e27f6f83b949；production 环境 087e7ce1-1838-495b-bc1e-4cf326bb9cd7；服务 c9ec983d-b7aa-4b40-964c-0eef0fe181c9；卷 2527aff6-44a5-49a6-9b25-3ae52a22bc4f，挂载 /app/data。
- PORT=17887、HOST=0.0.0.0、DATABASE_PATH=/app/data/travel.sqlite、COOKIE_SECURE=true、APP_ORIGIN 为线上 HTTPS origin、RAILWAY_RUN_UID=0、MAX_CONCURRENT_RUNS=2，单实例、Serverless=false，健康路径 /api/health。
- 第一次构建被 Railway 拒绝，原因是 Docker VOLUME 不支持；删除声明后平台构建成功，代码 cb6599e。成功部署 2baadce8-d7ea-4c24-a917-a89a8e86a0ea；重新部署验收 0e5e7dca-4bf0-4aa1-b5dc-26287b7d319a，实例从 92ff2b6e 变为 f2abed7e。
- 实测首页、API、Secure/HttpOnly/SameSiteStrict cookie、同源保护；390×844 手机浏览器实测两入口表单、示例行程锁定及设置页。线上截图 artifacts/online-home-20261005.png、artifacts/online-trip-20261005.png。
- 通过 Railway Console 写入独立 deployment_check 测试标记，重新部署后读取成功并清理，仅证明 SQLite 跨部署保留，不代表真实 AI 验收。未修改用户行程。
- health.ready=false，缺 MODEL_API_KEY、MODEL_NAME、AMAP_WEB_KEY，真实 AI 按之前约定待后续服务配置；密钥由用户在平台服务端变量填写，不发在聊天中。
- 登录时账号为 Trial，30 天／$5 剩余额度，未购买订阅；自动备份未设置，试用不能当作永久免费托管。
- Source 页面 auto deploy unavailable，当前通过 Check for updates → Update + Deploy Changes 更新，不假设 GitHub 推送自动发布。后续复用同一项目、服务与卷，无需重新创建或再次询问已有链路。
