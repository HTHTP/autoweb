// AI 代码生成器 - 集成豆包 API
const OpenAI = require('openai')
const templates = require('./templates')

// 初始化豆包聊天API客户端
const arkChatClient = new OpenAI({
    apiKey: process.env.ARK_API_KEY || '',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
})

// 初始化豆包图像生成API客户端
const arkImageClient = new OpenAI({
    apiKey: process.env.ARK_API_KEY || '',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
})

// 配置豆包模型ID
const CHAT_MODEL = 'ep-20250728192938-68tdn'  // 聊天模型
const IMAGE_MODEL = 'ep-20250728193153-qrpp4' // 图像生成模型

// 生成 HTML 代码 - 完整流程
async function generateHTML({ description, components = [], style = 'modern' }, progressCallback = null) {
    try {
        console.log('开始生成网页...')

        // 检查是否配置了 API Key
        if (!process.env.ARK_API_KEY) {
            console.warn('未配置 ARK_API_KEY，使用模拟生成')
            return await mockAIGeneration(description, components, style)
        }

        // 步骤1: 开始UI设计
        if (progressCallback) progressCallback('开始 UI 设计')
        const uiDesign = await generateUIDesign(description, components, style)

        // 步骤2: UI设计完成
        if (progressCallback) progressCallback('UI 设计完成')

        // 步骤3: 开始生成网页代码
        if (progressCallback) progressCallback('开始生成网页代码')
        const generatedCode = await generateWebpageCode(description, components, style, uiDesign)

        // 步骤4: 代码生成完毕
        if (progressCallback) progressCallback('代码生成完毕')

        // 步骤5: 开始生成网页配图
        if (progressCallback) progressCallback('开始生成网页配图')
        const images = await generateWebpageImages(description, style)

        // 步骤6: 生成网页配图完成
        if (progressCallback) progressCallback('生成网页配图完成')

        // 步骤7: 开始部署网页
        if (progressCallback) progressCallback('开始部署网页')
        const finalCode = await integrateImagesIntoCode(generatedCode, images)

        // 步骤8: 部署网页完成
        if (progressCallback) progressCallback('部署网页完成')

        return finalCode
    } catch (error) {
        console.error('生成代码失败:', error)
        // 如果 API 调用失败，回退到模拟生成
        console.warn('API 调用失败，回退到模拟生成')
        return await mockAIGeneration(description, components, style)
    }
}

// 步骤1: 生成UI设计方案
async function generateUIDesign(description, components, style) {
    try {
        const systemMessage = {
            role: "system",
            content: `你是一个专业的UI/UX设计师，擅长网页界面设计。

任务：根据用户需求生成详细的UI设计方案

要求：
1. 分析用户需求，确定页面布局结构
2. 设计合理的色彩搭配方案
3. 规划组件的排列和层次
4. 考虑用户体验和交互流程
5. 提供具体的设计规范

请返回JSON格式的设计方案，包含：
- layout: 布局结构描述
- colorScheme: 色彩方案
- typography: 字体规范
- components: 组件设计说明
- images: 需要的图片描述列表`
        }

        const userMessage = {
            role: "user",
            content: `请为以下需求设计UI方案：

描述：${description}
组件：${components.join('、')}
风格：${style}

请提供详细的UI设计方案。`
        }

        console.log('正在生成UI设计方案...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [systemMessage, userMessage],
            temperature: 0.7,
            max_tokens: 2000
        })

        const content = response?.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('UI设计方案生成失败')
        }

        // 尝试解析JSON，如果失败返回默认设计
        try {
            return JSON.parse(content)
        } catch (e) {
            return getDefaultUIDesign(description, components, style)
        }

    } catch (error) {
        console.error('UI设计生成失败:', error)
        return getDefaultUIDesign(description, components, style)
    }
}

// 步骤2: 生成网页代码
async function generateWebpageCode(description, components, style, uiDesign) {
    try {
        const systemMessage = {
            role: "system",
            content: `你是一个专业的Vue3前端开发工程师。

任务：根据UI设计方案生成完整的Vue3项目代码

要求：
1. 严格按照UI设计方案实现页面
2. 使用Element Plus组件库
3. 代码要组件化、可维护
4. 包含路由配置和项目结构
5. 响应式设计，兼容移动端

请返回JSON格式的项目结构。`
        }

        const userMessage = {
            role: "user",
            content: `请根据以下信息生成Vue3项目：

需求描述：${description}
UI设计方案：${JSON.stringify(uiDesign)}
组件需求：${components.join('、')}
样式风格：${style}

请生成完整的Vue3项目结构。`
        }

        console.log('正在生成网页代码...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [systemMessage, userMessage],
            temperature: 0.5,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('代码生成失败')
        }

        // 解析并生成Vue3项目
        return await generateVue3Project(content, description, style)

    } catch (error) {
        console.error('代码生成失败:', error)
        // 回退到默认模板
        const defaultProject = await generateDefaultVue3Project(description, style)
        return await createVue3ProjectFiles(defaultProject, description, style)
    }
}

// 步骤3: 生成网页配图
async function generateWebpageImages(description, style) {
    try {
        const images = []

        // 生成主要配图
        const mainImagePrompt = generateImagePrompt(description, style, 'hero')
        console.log('正在生成主图:', mainImagePrompt)

        try {
            const heroImageResponse = await arkImageClient.images.generate({
                model: IMAGE_MODEL,
                prompt: mainImagePrompt,
                size: "1024x1024",
                response_format: "url"
            })

            if (heroImageResponse.data && heroImageResponse.data[0]) {
                images.push({
                    type: 'hero',
                    url: heroImageResponse.data[0].url,
                    description: '主图'
                })
                console.log('主图生成成功:', heroImageResponse.data[0].url)
            }
        } catch (error) {
            console.error('主图生成失败:', error.message)
        }

        // 生成背景图
        const bgImagePrompt = generateImagePrompt(description, style, 'background')
        console.log('正在生成背景图:', bgImagePrompt)

        try {
            const bgImageResponse = await arkImageClient.images.generate({
                model: IMAGE_MODEL,
                prompt: bgImagePrompt,
                size: "1024x1024",
                response_format: "url"
            })

            if (bgImageResponse.data && bgImageResponse.data[0]) {
                images.push({
                    type: 'background',
                    url: bgImageResponse.data[0].url,
                    description: '背景图'
                })
                console.log('背景图生成成功:', bgImageResponse.data[0].url)
            }
        } catch (error) {
            console.error('背景图生成失败:', error.message)
        }

        // 生成装饰图
        const decorImagePrompt = generateImagePrompt(description, style, 'decoration')
        console.log('正在生成装饰图:', decorImagePrompt)

        try {
            const decorImageResponse = await arkImageClient.images.generate({
                model: IMAGE_MODEL,
                prompt: decorImagePrompt,
                size: "1024x1024",
                response_format: "url"
            })

            if (decorImageResponse.data && decorImageResponse.data[0]) {
                images.push({
                    type: 'decoration',
                    url: decorImageResponse.data[0].url,
                    description: '装饰图'
                })
                console.log('装饰图生成成功:', decorImageResponse.data[0].url)
            }
        } catch (error) {
            console.error('装饰图生成失败:', error.message)
        }

        console.log(`成功生成 ${images.length} 张图片`)
        return images

    } catch (error) {
        console.error('图片生成过程失败:', error)
        return []
    }
}

// 步骤4: 将图片集成到代码中
async function integrateImagesIntoCode(codeStructure, images) {
    try {
        if (!images || images.length === 0) {
            return codeStructure
        }

        // 解析代码结构
        let projectStructure
        try {
            projectStructure = JSON.parse(codeStructure)
        } catch (e) {
            return codeStructure
        }

        // 为每种类型的图片找到合适的位置
        const heroImage = images.find(img => img.type === 'hero')
        const bgImage = images.find(img => img.type === 'background')
        const decorImage = images.find(img => img.type === 'decoration')

        // 更新项目文件中的图片引用
        Object.keys(projectStructure).forEach(filePath => {
            if (filePath.endsWith('.vue') && typeof projectStructure[filePath] === 'string') {
                let content = projectStructure[filePath]

                // 替换主图
                if (heroImage) {
                    content = content.replace(
                        /src="[^"]*placeholder[^"]*"/g,
                        `src="${heroImage.url}"`
                    )
                    content = content.replace(
                        /background-image:\s*url\([^)]*placeholder[^)]*\)/g,
                        `background-image: url(${heroImage.url})`
                    )
                }

                // 替换背景图
                if (bgImage) {
                    content = content.replace(
                        /background:\s*linear-gradient[^;]*/g,
                        `background: url(${bgImage.url}) center/cover`
                    )
                }

                // 添加装饰图
                if (decorImage && content.includes('decoration')) {
                    content = content.replace(
                        /src="[^"]*decoration[^"]*"/g,
                        `src="${decorImage.url}"`
                    )
                }

                projectStructure[filePath] = content
            }
        })

        return JSON.stringify(projectStructure, null, 2)

    } catch (error) {
        console.error('图片集成失败:', error)
        return codeStructure
    }
}

// 生成图片提示词
function generateImagePrompt(description, style, imageType) {
    const styleMap = {
        modern: '现代简约风格',
        business: '商务专业风格',
        cute: '可爱卡通风格',
        tech: '科技未来风格'
    }

    const typeMap = {
        hero: '主图，突出主题',
        background: '背景图，简洁大气',
        decoration: '装饰图，精美细致'
    }

    const styleDesc = styleMap[style] || '现代简约风格'
    const typeDesc = typeMap[imageType] || '配图'

    return `${styleDesc}，${typeDesc}，与"${description}"主题相关，高质量，专业设计，网页用图`
}

// 获取默认UI设计方案
function getDefaultUIDesign(description, components, style) {
    return {
        layout: "响应式布局，头部导航+主内容区+页脚",
        colorScheme: {
            primary: style === 'business' ? '#2c3e50' : '#409eff',
            secondary: '#f8f9fa',
            accent: style === 'cute' ? '#ff6b9d' : '#67c23a'
        },
        typography: {
            headingFont: 'system-ui, sans-serif',
            bodyFont: 'system-ui, sans-serif',
            headingSize: '2rem',
            bodySize: '1rem'
        },
        components: components.map(comp => ({
            name: comp,
            style: `${style}风格的${comp}组件`
        })),
        images: [
            { type: 'hero', description: '主图展示' },
            { type: 'background', description: '背景装饰' },
            { type: 'decoration', description: '细节装饰' }
        ]
    }
}

// 修改 HTML 代码
async function modifyHTML({ currentCode, modification }) {
    try {
        console.log('开始修改代码...', { modification })

        // 检查是否配置了 API Key
        if (!process.env.ARK_API_KEY) {
            console.warn('未配置 ARK_API_KEY，使用模拟修改')
            return await mockAIModification(currentCode, modification)
        }

        // 使用豆包 API 修改代码
        const modifiedCode = await realAIModification(currentCode, modification)

        return modifiedCode
    } catch (error) {
        console.error('修改代码失败:', error)
        // 如果 API 调用失败，回退到模拟修改
        console.warn('API 调用失败，回退到模拟修改')
        return await mockAIModification(currentCode, modification)
    }
}

// 使用豆包 API 生成代码
async function realAIGeneration(description, components, style) {
    try {
        const systemMessage = {
            role: "system",
            content: `你是一个专业的Vue3前端开发工程师，擅长创建完整的Vue3项目结构。

要求：
1. 分析用户需求，设计合理的页面结构和组件划分
2. 生成完整的Vue3项目文件结构
3. 使用Element Plus UI库
4. 代码要组件化、模块化、可维护
5. 包含适当的路由配置
6. 样式要现代化、响应式
7. 包含必要的配置文件

请返回JSON格式的项目结构，包含以下字段：
{
  "projectName": "项目名称",
  "pages": [
    {
      "name": "页面名称",
      "path": "路由路径", 
      "component": "组件名称",
      "vue": "Vue组件代码"
    }
  ],
  "components": [
    {
      "name": "组件名称",
      "vue": "Vue组件代码"
    }
  ],
  "router": "路由配置代码",
  "main": "main.js代码",
  "app": "App.vue代码",
  "package": "package.json内容"
}`
        }

        const userMessage = {
            role: "user",
            content: `请根据以下要求生成Vue3项目结构：

描述：${description}
${components.length > 0 ? `需要包含的组件：${components.join('、')}` : ''}
样式风格：${style}

请生成一个完整的Vue3项目结构，包含合理的页面划分和组件设计。`
        }

        console.log('正在调用豆包 API...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [systemMessage, userMessage],
            temperature: 0.7,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (typeof content !== 'string') {
            throw new Error('AI回复内容为空')
        }

        console.log('豆包 API 调用成功，内容长度:', content.length)

        // 解析AI返回的JSON结构并生成项目文件
        return await generateVue3Project(content, description, style)

    } catch (error) {
        console.error('豆包 API 调用失败:', error)
        throw new Error("豆包 API 调用失败: " + error.message)
    }
}

// 生成完整的Vue3项目结构
async function generateVue3Project(aiResponse, description, style) {
    try {
        let projectData;

        // 尝试解析AI返回的JSON
        try {
            projectData = JSON.parse(aiResponse);
        } catch (parseError) {
            console.log('AI返回内容不是JSON格式，使用模板生成');
            projectData = await generateDefaultVue3Project(description, style);
        }

        // 生成完整的项目文件结构
        return await createVue3ProjectFiles(projectData, description, style);

    } catch (error) {
        console.error('生成Vue3项目失败:', error);
        // 回退到默认项目模板
        const defaultProject = await generateDefaultVue3Project(description, style);
        return await createVue3ProjectFiles(defaultProject, description, style);
    }
}

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

// 使用豆包 API 修改代码
async function realAIModification(currentCode, modification) {
    try {
        const systemMessage = {
            role: "system",
            content: `你是一个专业的前端开发工程师，擅长修改和优化现有的代码。

要求：
1. 仔细分析用户的修改要求
2. 对现有代码进行精确的修改
3. 保持代码的整体结构和功能不变
4. 确保修改后的代码仍然可以正常运行
5. 保持代码风格的一致性

请直接返回修改后的完整代码，不要包含任何解释文字。`
        }

        const userMessage = {
            role: "user",
            content: `请根据以下修改要求，对现有代码进行修改：

修改要求：${modification}

现有代码：
${currentCode}

请返回修改后的完整代码。`
        }

        console.log('正在调用豆包 API 修改代码...')

        const response = await arkChatClient.chat.completions.create({
            model: CHAT_MODEL,
            messages: [systemMessage, userMessage],
            temperature: 0.3,
            max_tokens: 8000
        })

        const content = response?.choices?.[0]?.message?.content
        if (typeof content !== 'string') {
            throw new Error('AI回复内容为空')
        }

        console.log('豆包 API 修改成功，代码长度:', content.length)
        return content

    } catch (error) {
        console.error('豆包 API 修改失败:', error)
        throw new Error("豆包 API 修改失败: " + error.message)
    }
}

// 模拟 AI 生成（实际项目中替换为真实的 LLM 调用）
async function mockAIGeneration(description, components, style) {
    console.log('使用模拟生成...')
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // 根据描述选择合适的模板
    let template = templates.basic

    if (description.includes('导航') || description.includes('菜单')) {
        template = templates.withNavigation
    }
    if (description.includes('表格') || description.includes('数据')) {
        template = templates.withTable
    }
    if (description.includes('表单') || description.includes('输入')) {
        template = templates.withForm
    }
    if (description.includes('卡片') || description.includes('商品') || description.includes('产品')) {
        template = templates.withCards
    }

    // 根据样式调整
    const styleClass = getStyleClass(style)

    // 生成最终代码
    return template
        .replace(/{{description}}/g, description)
        .replace(/{{styleClass}}/g, styleClass)
        .replace(/{{timestamp}}/g, new Date().toLocaleString('zh-CN'))
}

// 模拟 AI 修改
async function mockAIModification(currentCode, modification) {
    console.log('使用模拟修改...')
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

    let modifiedCode = currentCode

    // 简单的修改逻辑（实际项目中由 LLM 处理）
    if (modification.includes('红色') || modification.includes('红')) {
        modifiedCode = modifiedCode.replace(/blue/gi, 'red')
        modifiedCode = modifiedCode.replace(/#409eff/gi, '#f56c6c')
        modifiedCode = modifiedCode.replace(/primary/gi, 'danger')
    }

    if (modification.includes('绿色') || modification.includes('绿')) {
        modifiedCode = modifiedCode.replace(/blue/gi, 'green')
        modifiedCode = modifiedCode.replace(/#409eff/gi, '#67c23a')
        modifiedCode = modifiedCode.replace(/primary/gi, 'success')
    }

    if (modification.includes('大') || modification.includes('bigger')) {
        modifiedCode = modifiedCode.replace(/font-size:\s*14px/gi, 'font-size: 18px')
        modifiedCode = modifiedCode.replace(/font-size:\s*16px/gi, 'font-size: 20px')
    }

    if (modification.includes('小') || modification.includes('smaller')) {
        modifiedCode = modifiedCode.replace(/font-size:\s*16px/gi, 'font-size: 14px')
        modifiedCode = modifiedCode.replace(/font-size:\s*18px/gi, 'font-size: 16px')
    }

    if (modification.includes('居中') || modification.includes('center')) {
        modifiedCode = modifiedCode.replace(/<div class="container">/gi, '<div class="container" style="text-align: center;">')
    }

    return modifiedCode
}

// 获取样式类名
function getStyleClass(style) {
    const styles = {
        modern: 'modern-style',
        business: 'business-style',
        cute: 'cute-style',
        tech: 'tech-style'
    }
    return styles[style] || 'modern-style'
}

module.exports = {
    generateHTML,
    modifyHTML
}
