# 🚀 智能手表电商详情页 - 快速启动指南

## 欢迎使用AI生成的Vue 3项目！

这是一个专为智能手表等消费电子产品设计的电商详情页面。

## 📋 启动步骤

### 1. 安装Node.js
确保您的系统已安装Node.js (推荐版本 16+)
- 下载地址: https://nodejs.org/

### 2. 安装项目依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 在浏览器中查看
打开浏览器访问: http://localhost:5173

## 📁 项目结构说明

```
src/
├── components/     # 可复用组件
├── views/         # 页面组件
├── router/        # 路由配置
├── assets/        # 静态资源
├── App.vue        # 根组件
├── main.js        # 入口文件
└── style.css      # 全局样式
```

## 🎨 主要功能

- ✅ 顶部品牌导航栏
- ✅ 搜索功能
- ✅ 产品轮播图展示
- ✅ 产品信息和规格选择
- ✅ 库存提示
- ✅ 产品参数表格
- ✅ 使用场景展示
- ✅ 用户评价系统
- ✅ 购物车功能
- ✅ 立即购买按钮
- ✅ 数量调整器
- ✅ 售后保障说明

## 🔧 自定义开发

### 修改颜色主题
编辑 `src/style.css` 中的CSS变量:
```css
:root {
  --primary-color: #00d4aa;
  --success-color: #00b894;
  /* 更多颜色配置... */
}
```

### 添加新组件
1. 在 `src/components/` 目录下创建新的Vue文件
2. 在需要的地方导入并使用

### 修改路由
编辑 `src/router/index.js` 添加新的路由配置

## 📚 相关文档

- [Vue 3 官方文档](https://v3.vuejs.org/)
- [Element Plus 组件库](https://element-plus.org/)
- [Vite 构建工具](https://vitejs.dev/)

## ❓ 常见问题

**Q: 如何添加新页面？**
A: 在 `src/views/` 目录下创建新的Vue文件，然后在路由中配置

**Q: 如何修改样式？**
A: 可以直接在组件的 `<style>` 标签中修改，或者在 `src/style.css` 中修改全局样式

**Q: 如何部署到服务器？**
A: 运行 `npm run build` 生成dist目录，然后将dist目录部署到服务器

---

🎉 **开始您的开发之旅吧！**
