# 课程论文个人检测平台

研究生课程论文写作训练与学术规范在线检测平台。

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | FastAPI + SQLAlchemy (async) + JWT |
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 数据库 | Oracle (生产) / SQLite (开发) |
| 图表 | ECharts 5 |

## 快速启动

### 后端

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

### 前端

```bash
cd web
npm install
npm run dev
```

前端运行在 `http://localhost:5183`（局域网可用 `http://<本机IP>:5183` 访问），自动代理 `/api` 请求到后端 `http://localhost:8002`。

## 项目结构

```
personal-detection-site/
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── core/     # 配置、安全、响应封装
│   │   ├── models/   # 数据模型
│   │   ├── schemas/  # Pydantic DTO
│   │   ├── api/v1/   # API 路由
│   │   ├── services/ # 业务逻辑
│   │   ├── detection/# 检测适配器（Mock / VPCS）
│   │   └── db/       # 数据库会话
│   └── requirements.txt
├── web/              # React 前端
│   ├── src/
│   │   ├── pages/    # 页面组件
│   │   ├── components/ # 通用组件
│   │   ├── stores/   # Zustand 状态管理
│   │   └── api/      # API 客户端
│   └── package.json
└── README.md
```

## 功能模块

- **用户系统**：注册、登录、JWT 认证、个人资料管理
- **检测流程**：文件上传 → 检测提交 → 实时进度 → 报告生成
- **四维报告**：学术规范 / 学术诚信 / 学术表达 / 批判性思维
- **积分系统**：余额管理、充值套餐、消费记录
- **邀请分享**：邀请码注册赠送检测次数
