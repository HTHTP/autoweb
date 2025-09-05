import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCodeStore = defineStore('code', () => {
  // 状态
  const generatedCode = ref('')
  const isGenerating = ref(false)
  const isModifying = ref(false)
  const modificationText = ref('')
  const generateProgress = ref(0)
  const generateStatus = ref('')
  const showProgress = ref(false)
  const activeTab = ref('code')

  // 用户输入相关
  const inputMethod = ref<'text' | 'sketch'>('text')
  const selectedLibrary = ref('Element Plus')
  const userPrompt = ref('')

  // 组件库数据
  const componentLibraries = ref([
    {
      name: 'Element Plus',
      icon: '/elementlogo.png',
      description: '基于 Vue 3 的组件库',
      color: '#409EFF',
      bgColor: '#E6F7FF'
    },
    {
      name: 'Ant Design Vue',
      icon: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      description: '企业级 UI 设计语言',
      color: '#1890FF',
      bgColor: '#F0F9FF'
    },
    {
      name: 'Naive UI',
      icon: 'https://www.naiveui.com//assets/naivelogo-BdDVTUmz.svg',
      description: '轻量级 Vue 3 组件库',
      color: '#18A058',
      bgColor: '#F0F9F0'
    },
    {
      name: 'Quasar',
      icon: 'https://cdn.quasar.dev/logo-v2/svg/logo-dark.svg',
      description: '全功能 Vue.js 框架',
      color: '#1976D2',
      bgColor: '#E3F2FD'
    }
  ])

  // 计算属性
  const canGenerate = computed(() => {
    if (inputMethod.value === 'text') {
      return userPrompt.value.trim().length > 0
    }
    return false
  })

  // 方法
  const setGeneratedCode = (code: string) => {
    generatedCode.value = code
    activeTab.value = 'code'
  }

  const setGenerating = (loading: boolean) => {
    isGenerating.value = loading
  }

  const setModifying = (loading: boolean) => {
    isModifying.value = loading
  }

  const setProgress = (status: string, progress: number) => {
    generateStatus.value = status
    generateProgress.value = progress
  }

  const setShowProgress = (show: boolean) => {
    showProgress.value = show
  }

  const clearCode = () => {
    generatedCode.value = ''
    modificationText.value = ''
    generateProgress.value = 0
    generateStatus.value = ''
    showProgress.value = false
  }

  const loadDemoCode = () => {
    const demoProject = {
     
        "demo-project/package.json": JSON.stringify({
          "name": "ai-vue-demo",
          "version": "1.0.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
          },
          "dependencies": {
            "vue": "^3.5.17",
            "element-plus": "^2.10.4"
          },
          "devDependencies": {
            "@vitejs/plugin-vue": "^5.1.4",
            "vite": "^6.0.1"
          }
        }, null, 2),
        "demo-project/index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Vue3 + Element Plus Demo</title>\n</head>\n<body>\n  <div id=\"app\"></div>\n  <script type=\"module\" src=\"/src/main.js\"></script>\n</body>\n</html>",
        "demo-project/vite.config.js": "import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\n\nexport default defineConfig({\n  plugins: [vue()]\n})",
        "demo-project/src/main.js": "import { createApp } from 'vue'\nimport ElementPlus from 'element-plus'\nimport 'element-plus/dist/index.css'\nimport App from './App.vue'\n\nconst app = createApp(App)\napp.use(ElementPlus)\napp.mount('#app')",
        "demo-project/src/App.vue": "<template>\n  <div class=\"app-container\">\n    <el-card class=\"demo-card\">\n      <h1>🎉 Vue3 + Element Plus 演示</h1>\n      <p>这是一个完整的Vue3项目演示</p>\n      <el-row :gutter=\"20\">\n        <el-col :span=\"12\">\n          <el-input v-model=\"message\" placeholder=\"请输入内容\" />\n        </el-col>\n        <el-col :span=\"12\">\n          <el-button type=\"primary\" @click=\"showMessage\">显示消息</el-button>\n        </el-col>\n      </el-row>\n      <div v-if=\"displayMessage\" class=\"message-display\">\n        <el-alert :title=\"displayMessage\" type=\"success\" show-icon />\n      </div>\n    </el-card>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { ElMessage } from 'element-plus'\n\nconst message = ref('')\nconst displayMessage = ref('')\n\nconst showMessage = () => {\n  if (message.value.trim()) {\n    displayMessage.value = message.value\n    ElMessage.success('消息已显示')\n  } else {\n    ElMessage.warning('请输入内容')\n  }\n}\n</script>\n\n<style scoped>\n.app-container {\n  padding: 20px;\n  min-height: 100vh;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.demo-card {\n  max-width: 600px;\n  width: 100%;\n  text-align: center;\n}\n\n.message-display {\n  margin-top: 20px;\n}\n\nh1 {\n  color: #409eff;\n  margin-bottom: 20px;\n}\n</style>",
        "demo-project/src/components/HelloWorld.vue": "<template>\n  <div class=\"hello-world\">\n    <h2>{{ title }}</h2>\n    <p>{{ description }}</p>\n    <el-button type=\"primary\" @click=\"handleClick\">点击我</el-button>\n  </div>\n</template>\n\n<script setup>\nimport { ElMessage } from 'element-plus'\n\ndefineProps({\n  title: {\n    type: String,\n    default: 'Hello World'\n  },\n  description: {\n    type: String,\n    default: '这是一个Vue3组件示例'\n  }\n})\n\nconst handleClick = () => {\n  ElMessage.success('Hello World组件被点击了！')\n}\n</script>\n\n<style scoped>\n.hello-world {\n  padding: 20px;\n  border-radius: 8px;\n  background: #f0f9ff;\n  border: 1px solid #e0f2fe;\n}\n\nh2 {\n  color: #0284c7;\n  margin-bottom: 10px;\n}\n</style>",
        "demo-project/README.md": "# Vue 3 + Element Plus 演示项目\n\n这是一个使用 Vue 3 和 Element Plus 构建的演示项目。\n\n## 技术栈\n\n- Vue 3\n- Element Plus\n- Vite\n\n## 开发\n\n```bash\n# 安装依赖\nnpm install\n\n# 启动开发服务器\nnpm run dev\n\n# 构建生产版本\nnpm run build\n```\n\n## 功能特性\n\n- 现代化的 Vue 3 Composition API\n- 丰富的 Element Plus 组件\n- 响应式设计\n- 优雅的用户界面\n"
      
    }

    generatedCode.value = JSON.stringify(demoProject, null, 2)
    activeTab.value = 'code'
  }

  return {
    // 状态
    generatedCode,
    isGenerating,
    isModifying,
    modificationText,
    generateProgress,
    generateStatus,
    showProgress,
    activeTab,
    inputMethod,
    selectedLibrary,
    userPrompt,
    componentLibraries,
    
    // 计算属性
    canGenerate,
    
    // 方法
    setGeneratedCode,
    setGenerating,
    setModifying,
    setProgress,
    setShowProgress,
    clearCode,
    loadDemoCode
  }
})
