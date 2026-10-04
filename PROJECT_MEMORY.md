
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
- 不把静态首页发布当作完整产品上线，不擅自订阅付费套餐。GitHub 源码保持私有。
- 本轮验证：生产构建通过；使用随机端口启动隔离的内存数据库服务，执行 Dockerfile 中的实际健康检查表达式，退出码 0；health.status=ok、ready=false。
