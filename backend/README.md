# 代码生成后端服务

这是一个基于 Express 和 TypeScript 的后端服务，用于支持前端应用的代码生成、修改和导出功能。

## 功能特性

- **代码生成**：根据用户提供的需求描述、组件列表和设计风格，生成前端代码
- **代码修改**：根据用户提供的当前代码和修改要求，对代码进行精确修改
- **代码导出**：支持将生成或修改后的代码导出为单个 HTML 文件或压缩包

## 技术栈

- Node.js
- Express
- TypeScript
- Axios
- OpenAI API

## 环境要求

- Node.js 14+
- npm 6+ 或 yarn 1+ 或 pnpm 5+

## 安装依赖

```bash
cd backend
npm install
```

## 配置环境变量

在项目根目录创建`.env`文件，并添加以下配置：

```
ARK_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.ark.cn/v1
PORT=3000
```

## 开发模式

启动开发服务器，支持代码热重载：

```bash
npm run dev
```

## 构建项目

```bash
npm run build
```

构建后的文件会生成在`dist`目录中。

## 启动生产服务器

```bash
npm start
```

## API 接口

### 代码生成

**POST /api/generate**

请求参数：

```json
{
  "description": "需求描述",
  "components": ["组件1", "组件2"],
  "style": "设计风格",
  "sync": false // 是否同步模式，默认为false
}
```

响应（异步模式）：

```json
{
  "success": true,
  "taskId": "任务ID",
  "message": "代码生成任务已启动",
  "mode": "async"
}
```

响应（同步模式）：

```json
{
  "success": true,
  "code": "生成的代码",
  "message": "代码生成成功",
  "mode": "sync"
}
```

### 查询生成进度

**GET /api/generate/progress/:taskId**

响应：

```json
{
  "success": true,
  "status": "processing/completed/failed",
  "progress": 50,
  "message": "任务处理中",
  "code": "生成的代码", // 当status为completed时返回
  "error": "错误信息" // 当status为failed时返回
}
```

### 代码修改

**POST /api/modify**

请求参数：

```json
{
  "currentCode": "当前代码",
  "modification": "修改要求"
}
```

响应：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "code": "修改后的代码",
    "message": "代码修改成功"
  }
}
```

### 代码导出

**POST /api/export**

请求参数：

```json
{
  "code": "要导出的代码",
  "format": "zip/single", // 导出格式，默认为single
  "filename": "自定义文件名" // 自定义文件名，可选
}
```

响应：

- 当 format 为 single 时，返回 HTML 文件
- 当 format 为 zip 时，返回压缩包文件

## 项目结构

```
backend/
├── .env                 # 环境变量配置
├── .gitignore           # Git忽略文件
├── dev.js               # 开发启动脚本
├── package.json         # 项目配置和依赖
├── tsconfig.json        # TypeScript配置
├── dist/                # 构建输出目录
└── src/                 # 源代码目录
    ├── index.ts         # 主入口文件
    ├── routes/          # API路由
    │   ├── generate.ts  # 代码生成路由
    │   ├── modify.ts    # 代码修改路由
    │   └── export.ts    # 代码导出路由
    └── utils/           # 工具函数
        ├── responseUtils.ts  # 响应处理工具
        └── fileUtils.ts      # 文件操作工具
```

## 注意事项

1. 确保配置了正确的 ARK_API_KEY 和 OpenAI API 地址
2. 开发环境中，代码会自动编译并重启服务器
3. 生产环境中，建议使用 PM2 等进程管理工具来运行服务
4. 临时文件会定期清理，避免占用过多磁盘空间

## License

ISC
