# AutoWeb - 自动网页生成器

基于豆包 AI 深度思考模型的自动 Vue3 项目生成器。

## 🚀 功能特性

- 🧠 **深度思考模型**: 集成豆包 API 的深度思考功能，生成更智能的代码
- 📋 **结构化输出**: 使用 JSON Schema 确保输出格式的一致性
- ✅ **项目验证**: 自动验证生成的 Vue 项目结构
- 🌊 **流式输出**: 支持实时查看生成过程
- 🎯 **多种测试**: 提供自动测试和交互式测试

## 📦 安装依赖

```bash
cd backend
npm install
```

## ⚙️ 配置

1. 复制环境变量示例文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，设置您的豆包 API 密钥：

```
ARK_API_KEY=your_ark_api_key_here
```

## 🏃‍♂️ 运行服务

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

服务将在 `http://localhost:3001` 启动。

## 🧪 测试

### 自动测试

运行预设的测试用例：

```bash
npm test
```

### 交互式测试

手动输入项目描述进行测试：

```bash
npm run test:interactive
```

## 📡 API 接口

### 生成项目

```http
POST /api/generate
Content-Type: application/json

{
  "description": "创建一个智能手表电商页面...",
  "options": {
    "enableThinking": true,
    "useStructuredOutput": true,
    "includeValidation": true
  }
}
```

### 流式生成

```http
POST /api/generate/stream
Content-Type: application/json

{
  "description": "项目描述..."
}
```

### 测试连接

```http
GET /api/test
```

### 验证项目

```http
POST /api/validate
Content-Type: application/json

{
  "project": { ... }
}
```

## 📋 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    "projectName": "智能手表电商",
    "description": "...",
    "files": [
      {
        "path": "src/App.vue",
        "content": "...",
        "type": "component"
      }
    ],
    "dependencies": ["vue", "vue-router"],
    "features": ["Vue 3", "TypeScript"]
  },
  "metadata": {
    "generationTime": 5432,
    "validation": {
      "valid": true,
      "errors": [],
      "warnings": []
    },
    "fileTree": "...",
    "stats": {
      "fileCount": 8,
      "fileTypes": ["component", "page", "router"],
      "dependencyCount": 5
    }
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": "详细错误信息"
}
```

## 🔧 项目结构

```
backend/
├── services/
│   └── aiService.js         # 豆包AI服务
├── routes/
│   └── api.js              # API路由
├── utils/
│   └── vueProjectValidator.js  # 项目验证器
├── server.js               # 主服务器
├── test.js                 # 测试文件
├── package.json
└── .env.example
```

## 📝 使用示例

### 智能手表电商页面

```
创建一个智能手表电商页面，包含产品展示、详情页面、购物车功能。
页面要现代化，使用深色主题，有产品图片轮播、规格选择、价格显示、
立即购买和加入购物车按钮。
```

### 企业官网

```
创建一个科技公司的企业官网，包含首页、关于我们、产品服务、
新闻动态、联系我们等页面。设计要简洁现代，使用蓝色主题。
```

### 个人博客

```
创建一个个人技术博客网站，包含文章列表、文章详情、分类标签、
搜索功能。界面要清爽简洁，适合阅读。
```

## 🤖 豆包 API 配置

本项目使用豆包（DouBao）AI 的深度思考模型：

- **模型**: `doubao-seed-1-6-250615`
- **API 地址**: `https://ark.cn-beijing.volces.com/api/v3`
- **超时时间**: 30 分钟（适合深度思考）
- **结构化输出**: 支持 JSON Schema

### 深度思考功能

- 模型会在生成前进行深度分析
- 可以查看推理过程 (`reasoning_content`)
- 生成结果更加全面和深入

## ⚠️ 注意事项

1. **API 密钥**: 确保正确设置 `ARK_API_KEY` 环境变量
2. **网络连接**: 需要稳定的网络连接到豆包 API
3. **超时设置**: 深度思考模型耗时较长，建议设置较长的超时时间
4. **速率限制**: 注意 API 的调用频率限制

## 🛠️ 故障排除

### API 连接失败

- 检查 `ARK_API_KEY` 是否正确设置
- 确认网络连接正常
- 验证 API 密钥是否有效

### 生成超时

- 简化项目描述
- 检查网络稳定性
- 考虑使用流式输出

### 验证失败

- 检查生成的项目结构
- 查看详细的错误信息
- 尝试重新生成

## 📞 支持

如有问题，请检查：

1. 环境变量配置
2. 网络连接状态
3. API 密钥有效性
4. 服务器运行状态
