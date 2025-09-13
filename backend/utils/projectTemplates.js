// 项目模板生成器 - 处理Vue3项目模板和默认组件生成
const templates = require('./templates')

// 生成默认的Vue3项目结构
async function generateDefaultVue3Project(description, style) {
    const projectName = "my-vue-app";

    return {
        projectName,
        pages: [
            {
                name: "Home",
                path: "/",
                component: "Home",
                vue: generateDefaultHomePage(description, style)
            },
            {
                name: "About",
                path: "/about",
                component: "About",
                vue: generateDefaultAboutPage(description, style)
            }
        ],
        components: [
            {
                name: "Header",
                vue: generateDefaultHeader(description, style)
            },
            {
                name: "Footer",
                vue: generateDefaultFooter(description, style)
            }
        ],
        router: generateDefaultRouter(),
        main: generateDefaultMain(),
        app: generateDefaultApp(),
        package: generateDefaultPackageJson(projectName)
    };
}

// 创建Vue3项目文件结构
async function createVue3ProjectFiles(projectData, description, style) {
    const projectStructure = {
        [`${projectData.projectName}/`]: "folder",
        [`${projectData.projectName}/package.json`]: projectData.package,
        [`${projectData.projectName}/vite.config.js`]: generateViteConfig(),
        [`${projectData.projectName}/index.html`]: generateIndexHTML(projectData.projectName),
        [`${projectData.projectName}/README.md`]: generateReadme(projectData.projectName, description),

        // src 目录
        [`${projectData.projectName}/src/`]: "folder",
        [`${projectData.projectName}/src/main.js`]: projectData.main,
        [`${projectData.projectName}/src/App.vue`]: projectData.app,
        [`${projectData.projectName}/src/style.css`]: generateDefaultStyles(style),

        // views 目录
        [`${projectData.projectName}/src/views/`]: "folder",

        // components 目录
        [`${projectData.projectName}/src/components/`]: "folder",

        // router 目录
        [`${projectData.projectName}/src/router/`]: "folder",
        [`${projectData.projectName}/src/router/index.js`]: projectData.router,

        // assets 目录
        [`${projectData.projectName}/src/assets/`]: "folder",
        [`${projectData.projectName}/src/assets/logo.vue`]: generateLogoComponent(),

        // public 目录
        [`${projectData.projectName}/public/`]: "folder",
        [`${projectData.projectName}/public/vite.svg`]: "<!-- Vite Logo SVG -->"
    };

    // 添加页面文件
    projectData.pages.forEach(page => {
        projectStructure[`${projectData.projectName}/src/views/${page.component}.vue`] = page.vue;
    });

    // 添加组件文件
    projectData.components.forEach(component => {
        projectStructure[`${projectData.projectName}/src/components/${component.name}.vue`] = component.vue;
    });

    return JSON.stringify(projectStructure, null, 2);
}

// 生成默认组件模板函数
function generateDefaultHomePage(description, style) {
    return `<template>
  <div class="home">
    <Header />
    <main class="main-content">
      <section class="hero">
        <h1>欢迎来到我的网站</h1>
        <p>${description}</p>
        <el-button type="primary" size="large">开始探索</el-button>
      </section>
      
      <section class="features">
        <el-row :gutter="20">
          <el-col :span="8" v-for="feature in features" :key="feature.id">
            <el-card class="feature-card">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const features = ref([
  { id: 1, title: '功能一', description: '这是功能一的描述' },
  { id: 2, title: '功能二', description: '这是功能二的描述' },
  { id: 3, title: '功能三', description: '这是功能三的描述' }
])
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.features {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
</style>`;
}

function generateDefaultAboutPage(description, style) {
    return `<template>
  <div class="about">
    <Header />
    <main class="main-content">
      <div class="about-container">
        <h1>关于我们</h1>
        <p>${description}</p>
        <div class="content">
          <el-row :gutter="20">
            <el-col :span="12">
              <h2>我们的使命</h2>
              <p>致力于创造优秀的用户体验，提供高质量的产品和服务。</p>
            </el-col>
            <el-col :span="12">
              <h2>我们的愿景</h2>
              <p>成为行业领先的技术创新公司，为客户创造价值。</p>
            </el-col>
          </el-row>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.about {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.about-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.content {
  margin-top: 3rem;
}

.content h2 {
  color: #555;
  margin-bottom: 1rem;
}
</style>`;
}

function generateDefaultHeader(description, style) {
    return `<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <h2>我的网站</h2>
      </div>
      <nav class="nav">
        <el-menu mode="horizontal" :default-active="$route.path" router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>
      </nav>
    </div>
  </header>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo h2 {
  color: #333;
  margin: 0;
}

.nav {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}
</style>`;
}

function generateDefaultFooter(description, style) {
    return `<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <p>&copy; 2024 我的网站. 保留所有权利.</p>
        <p>由 AI 网页生成器自动创建</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.footer {
  background: #333;
  color: white;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  text-align: center;
}

.footer-content p {
  margin: 0.5rem 0;
}
</style>`;
}

function generateDefaultRouter() {
    return `import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router`;
}

function generateDefaultMain() {
    return `import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')`;
}

function generateDefaultApp() {
    return `<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// App 组件逻辑
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f8f9fa;
}
</style>`;
}

function generateDefaultPackageJson(projectName) {
    return `{
  "name": "${projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.1",
    "element-plus": "^2.10.4",
    "vue": "^3.5.17",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "vite": "^7.0.4"
  }
}`;
}

function generateViteConfig() {
    return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})`;
}

function generateIndexHTML(projectName) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;
}

function generateReadme(projectName, description) {
    return `# ${projectName}

${description}

## 项目介绍

这是一个由 AI 网页生成器自动生成的 Vue 3 项目。

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Vite

## 开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
\`\`\`

## 项目结构

\`\`\`
src/
├── components/     # 通用组件
├── views/         # 页面组件
├── router/        # 路由配置
├── assets/        # 静态资源
├── App.vue        # 根组件
├── main.js        # 入口文件
└── style.css      # 全局样式
\`\`\`

---

生成时间: ${new Date().toLocaleString('zh-CN')}
`;
}

function generateDefaultStyles(style) {
    const styleMap = {
        modern: `/* 现代简约风格 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}`,
        business: `/* 商务专业风格 */
:root {
  --primary-color: #2c3e50;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --info-color: #34495e;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  color: #2c3e50;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}`,
        cute: `/* 活泼可爱风格 */
:root {
  --primary-color: #ff6b9d;
  --success-color: #51cf66;
  --warning-color: #ffd43b;
  --danger-color: #ff6b6b;
  --info-color: #74c0fc;
}

body {
  font-family: 'Comic Sans MS', cursive, sans-serif;
  line-height: 1.6;
  color: #495057;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}`,
        tech: `/* 科技感风格 */
:root {
  --primary-color: #00d4aa;
  --success-color: #00b894;
  --warning-color: #fdcb6e;
  --danger-color: #e84393;
  --info-color: #636e72;
}

body {
  font-family: 'Fira Code', 'Monaco', monospace;
  line-height: 1.5;
  color: #2d3436;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}`
    };

    return styleMap[style] || styleMap.modern;
}

function generateLogoComponent() {
    return `<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 261.76 226.69">
    <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" fill="#41b883"/>
    <path d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z" fill="#34495e"/>
  </svg>
</template>

<script setup>
// Logo 组件
</script>

<style scoped>
svg {
  width: 32px;
  height: 32px;
}
</style>`;
}

module.exports = {
    generateDefaultVue3Project,
    createVue3ProjectFiles,
    generateDefaultHomePage,
    generateDefaultAboutPage,
    generateDefaultHeader,
    generateDefaultFooter,
    generateDefaultRouter,
    generateDefaultMain,
    generateDefaultApp,
    generateDefaultPackageJson,
    generateViteConfig,
    generateIndexHTML,
    generateReadme,
    generateDefaultStyles,
    generateLogoComponent
}