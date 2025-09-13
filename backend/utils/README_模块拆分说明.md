# 代码生成器模块拆分说明

## 拆分概述

原来的 `codeGenerator.js` 文件过于庞大，包含了多种不同的功能和 AI 提示词。现在已经按照功能模块进行了拆分，提高了代码的可维护性和可读性。

## 文件结构

### 1. `aiClients.js` - AI 客户端配置

- 豆包 API 客户端初始化
- 模型配置
- API Key 检查功能

### 2. `uiDesignGenerator.js` - UI 设计生成器

- UI 设计相关的 AI 提示词
- UI 设计方案生成逻辑
- 默认 UI 设计方案

### 3. `webpageCodeGenerator.js` - 网页代码生成器

- 网页代码生成的 AI 提示词
- Vue3 项目代码生成逻辑
- 项目结构解析和处理

### 4. `imageGenerator.js` - 图片生成器

- 图片生成功能
- 图片集成到代码中的逻辑
- 图片提示词生成

### 5. `codeModifier.js` - 代码修改器

- 代码修改的 AI 提示词
- 代码修改逻辑
- 模拟修改功能

### 6. `projectTemplates.js` - 项目模板生成器

- Vue3 项目模板生成
- 默认组件模板
- 项目文件结构创建

### 7. `generatorUtils.js` - 通用工具函数

- 各种辅助功能
- 模拟 AI 生成
- 字符串处理、验证等工具函数

### 8. `codeGenerator.js` - 主入口模块（重构后）

- 导入各个功能模块
- 提供统一的对外接口
- 主要的生成流程控制

## 优势

1. **模块化设计**：每个文件专注于特定功能，职责清晰
2. **易于维护**：修改某个功能时只需要关注对应的模块
3. **可复用性**：各个模块可以独立使用
4. **代码组织**：相关的提示词和逻辑放在一起，便于管理
5. **测试友好**：可以对每个模块进行单独测试

## 使用方式

主入口文件 `codeGenerator.js` 的使用方式保持不变：

```javascript
const { generateHTML, modifyHTML } = require("./utils/codeGenerator");

// 生成网页
const result = await generateHTML({
  description: "创建一个现代化的企业官网",
  components: ["导航栏", "轮播图", "产品展示"],
  style: "modern",
});

// 修改代码
const modified = await modifyHTML({
  currentCode: existingCode,
  modification: "将主色调改为红色",
});
```

## 注意事项

- 各个模块之间的依赖关系需要保持正确
- 修改模块时要确保不影响其他模块的功能
- 新增功能时建议按照现有的模块划分原则进行组织
