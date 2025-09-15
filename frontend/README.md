# AI HTML 生成器 - 前端界面

基于 Vue 3 + TypeScript + Vite 构建的 AI HTML 生成器前端界面。

## 功能特性

- 🎨 **自然语言生成**: 通过描述需求，AI 自动生成 HTML 网页
- 📄 **HTML 预览**: 实时预览生成的 HTML 网页效果
- 📝 **代码编辑**: 在线编辑和修改 HTML 代码
- 💾 **导入导出**: 支持导入已保存的 HTML 文件和导出新文件
- 📱 **响应式设计**: 适配各种设备屏幕

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite
- Element Plus
- Pinia (状态管理)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── components/         # Vue组件
│   ├── HeaderComponent.vue    # 头部导航
│   ├── InputPanel.vue         # 输入面板
│   ├── ContentPanel.vue       # 内容面板
│   ├── PreviewPanel.vue       # HTML预览组件
│   └── CodeEditor.vue         # 代码编辑器
├── stores/            # Pinia状态管理
│   └── code.ts        # 代码状态管理
├── views/             # 页面视图
│   └── HomePage.vue   # 主页面
├── api/               # API接口
│   └── generate.ts    # 生成相关API
└── router/            # 路由配置
    └── index.ts
```

## 主要功能

### 1. 自然语言生成

在左侧输入面板中描述你想要的网页，例如：

- "创建一个个人作品集网站，包含导航栏、英雄区域和联系表单"
- "制作一个产品介绍页面，使用蓝色主题"

### 2. HTML 预览

- 实时预览生成的 HTML 效果
- 支持分屏模式同时查看代码和预览
- 可在新窗口打开预览

### 3. 代码编辑

- 语法高亮的 HTML 代码编辑器
- 支持实时编辑和修改
- 自动保存编辑状态

### 4. 文件管理

- 导入之前保存的 HTML 文件
- 导出当前 HTML 文件
- 文件列表管理和预览

## 使用指南

1. **启动应用**: 运行开发服务器后访问 http://localhost:5173
2. **输入需求**: 在左侧面板选择"自然语言"模式，描述你的需求
3. **生成 HTML**: 点击"生成 HTML"按钮，等待 AI 生成
4. **预览效果**: 在右侧"网页预览"标签查看效果
5. **编辑代码**: 在"HTML 代码"标签中编辑和修改
6. **导出文件**: 点击头部"导出 HTML"按钮下载文件

## API 集成

前端通过 REST API 与后端通信：

- `POST /api/generate` - 生成 HTML 代码
- `GET /api/generate/progress/:taskId` - 查询生成进度
- `POST /api/generate/modify` - 修改 HTML 代码
- `GET /api/import/json-files` - 获取可导入文件列表

## 注意事项

- 确保后端服务在 http://localhost:3000 运行
- 生成过程是异步的，会显示进度状态
- 支持导入之前保存的项目文件
- 预览功能使用 iframe 实现，支持大部分 HTML 特性
