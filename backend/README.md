# AI Vue Code Generator 后端启动指南

## 概述

这是一个基于 Node.js + Express 的后端服务，用于根据用户的自然语言描述生成 Vue3 项目代码。系统集成了豆包 AI API，能够智能生成高质量的 Vue3 组件和完整项目结构。

## 核心功能

### 1. Vue3 代码生成

- **自然语言转代码**: 根据用户描述生成完整的 Vue3 项目
- **组件库集成**: 默认集成 Element Plus UI 组件库
- **项目结构完整**: 包含 package.json、vite.config.js、入口文件等
- **代码质量保证**: 遵循 Vue3 最佳实践，支持 Composition API

### 2. 代码修改优化

- **智能修改**: 根据用户需求对现有代码进行精确修改
- **批量修改**: 支持一次执行多个修改要求
- **代码优化**: 提供性能、可访问性、响应式等优化选项

### 3. 异步任务管理

- **任务队列**: 支持异步代码生成，避免长时间等待
- **进度跟踪**: 实时查询任务执行进度和状态
- **任务超时**: 自动处理超时任务，防止资源泄露

### 4. 代码导出功能

- **ZIP 打包**: 将生成的项目打包成可下载的 ZIP 文件
- **项目结构**: 自动生成 README.md 和.gitignore 文件
- **单文件导出**: 支持导出指定的单个文件

## 快速开始

### 1. 环境准备

确保系统已安装：

- Node.js >= 16.0.0
- npm >= 8.0.0

### 2. 安装依赖

\`\`\`bash
cd backend
npm install
\`\`\`

### 3. 配置环境变量

在项目根目录创建`.env`文件：

\`\`\`env

# 后端服务配置

PORT=3000

# 豆包 API 配置

ARK_API_KEY=your_ark_api_key_here

# 环境设置

NODE_ENV=development
\`\`\`

### 4. 启动服务

\`\`\`bash

# 开发模式（支持热重载）

npm run dev

# 或者使用管理脚本

node manage.js dev

# 生产模式

npm start
\`\`\`

### 5. 验证服务

访问健康检查接口：
\`\`\`bash
curl http://localhost:3000/health
\`\`\`

运行完整测试：
\`\`\`bash
npm test

# 或

node manage.js test
\`\`\`

## API 接口说明

### 代码生成接口

#### 1. 异步生成代码

\`\`\`http
POST /api/generate
Content-Type: application/json

{
"description": "创建一个用户管理页面，包含用户列表、添加用户、编辑用户功能",
"components": ["Element Plus"],
"style": "modern"
}
\`\`\`

#### 2. 查询生成进度

\`\`\`http
GET /api/generate/progress/{taskId}
\`\`\`

#### 3. 同步生成代码（用于测试）

\`\`\`http
POST /api/generate/sync
Content-Type: application/json

{
"description": "创建一个简单的登录表单",
"components": ["Element Plus"],
"style": "modern"
}
\`\`\`

### 代码修改接口

#### 1. 修改代码

\`\`\`http
POST /api/modify
Content-Type: application/json

{
"currentCode": "当前的完整代码（JSON 格式）",
"modification": "添加一个搜索框，支持按用户名搜索"
}
\`\`\`

#### 2. 代码优化

\`\`\`http
POST /api/modify/optimize
Content-Type: application/json

{
"currentCode": "当前的完整代码（JSON 格式）",
"optimizationType": "performance"
}
\`\`\`

### 代码导出接口

#### 1. 导出为 ZIP 文件

\`\`\`http
POST /api/export
Content-Type: application/json

{
"code": "完整的项目代码（JSON 格式）",
"projectName": "my-vue-project"
}
\`\`\`

#### 2. 预览项目结构

\`\`\`http
POST /api/export/preview
Content-Type: application/json

{
"code": "完整的项目代码（JSON 格式）"
}
\`\`\`

## 项目结构

\`\`\`
backend/
├── server.js # Express 服务器主文件
├── manage.js # 项目管理脚本
├── test-backend.js # 后端 API 测试
├── package.json # 项目依赖配置
├── .env # 环境变量配置
├── routes/ # API 路由
│ ├── generate.js # 代码生成路由
│ ├── modify.js # 代码修改路由
│ └── export.js # 代码导出路由
├── services/ # 业务服务
│ ├── ai-service.js # AI 服务封装
│ └── task-manager.js # 任务管理器
└── prompts/ # AI 提示词模板
└── vue3-prompts.js # Vue3 生成提示词
\`\`\`

## 管理脚本使用

项目提供了便捷的管理脚本 `manage.js`：

\`\`\`bash

# 安装依赖

node manage.js install

# 启动开发服务器

node manage.js dev

# 启动生产服务器

node manage.js start

# 运行测试

node manage.js test

# 检查环境配置

node manage.js check

# 查看项目状态

node manage.js status

# 显示帮助信息

node manage.js help
\`\`\`

## 开发调试

### 1. 日志查看

服务器会输出详细的运行日志，包括：

- API 请求记录
- AI 服务调用状态
- 任务执行进度
- 错误信息

### 2. 调试模式

设置环境变量 `NODE_ENV=development` 可以获得更详细的错误信息。

### 3. API 测试

使用内置的测试脚本验证所有功能：
\`\`\`bash
node test-backend.js
\`\`\`

## 常见问题

### 1. API 密钥配置

- 确保`.env`文件中的`ARK_API_KEY`配置正确
- 豆包 API 密钥可以从豆包开放平台获取

### 2. 端口冲突

- 默认使用 3000 端口，可在`.env`文件中修改`PORT`配置
- 确保前端配置的 API 地址与后端端口一致

### 3. 代码生成失败

- 检查网络连接是否正常
- 验证 API 密钥是否有效
- 查看控制台错误日志

### 4. 内存占用过高

- 任务管理器会自动清理过期任务
- 长时间运行建议定期重启服务

## 技术特性

- **豆包 AI 集成**: 使用火山引擎豆包大模型
- **异步处理**: 支持长时间 AI 生成任务
- **错误处理**: 完善的错误处理和降级机制
- **代码验证**: 自动验证生成代码的格式和完整性
- **任务管理**: 内存级任务队列，支持进度查询
- **文件导出**: 支持 ZIP 打包和单文件导出

## 安全考虑

- 输入验证：对所有用户输入进行严格验证
- 超时控制：防止长时间运行的任务占用资源
- 错误脱敏：生产环境下不暴露敏感错误信息
- CORS 配置：限制跨域访问来源

## 性能优化

- 异步任务：避免阻塞主线程
- 内存管理：定期清理过期任务
- 缓存机制：可选择添加 Redis 缓存
- 负载均衡：支持多实例部署
