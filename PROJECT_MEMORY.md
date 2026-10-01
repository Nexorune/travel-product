
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
