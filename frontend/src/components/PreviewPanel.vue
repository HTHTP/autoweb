<template>
  <div class="preview-container">
    <div class="preview-header">
      <span class="preview-title">实时预览</span>
      <div class="preview-actions">
        <el-button size="small" @click="refreshPreview" :disabled="!props.code">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
        <el-button size="small" @click="openInNewTab" :disabled="!props.code">
          <el-icon>
            <Link />
          </el-icon>
          新窗口打开
        </el-button>
      </div>
    </div>
    <div class="preview-content">
      <!-- 空状态显示 -->
      <div v-if="!props.code" class="preview-empty">
        <div class="empty-icon">🌟</div>
        <h3 class="empty-title">等待代码生成</h3>
        <p class="empty-description">
          请在左侧输入需求并生成代码，<br />
          生成的网页将在此处实时预览
        </p>
      </div>
      <!-- 预览框架 -->
      <iframe v-else ref="previewFrame" :srcdoc="processedCode" class="preview-iframe"
        sandbox="allow-scripts allow-same-origin" @load="onPreviewLoad"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, Link } from "@element-plus/icons-vue";

interface Props {
  code: string;
}

const props = defineProps<Props>();

const previewFrame = ref<HTMLIFrameElement>();

// 处理代码，添加必要的样式和脚本
const processedCode = computed(() => {
  if (!props.code) return "";

  // 检查是否是Vue项目JSON结构
  try {
    const projectData = JSON.parse(props.code);
    if (projectData["src/App.vue"] && projectData["src/main.js"]) {
      return createVueProjectHTML(projectData);
    }
  } catch (e) {
    // 不是JSON格式，继续处理其他格式
  }

  // 如果是完整的 HTML 文档，直接返回
  if (props.code.includes("<!DOCTYPE html>")) {
    return props.code;
  }

  // 否则包装成完整的 HTML 文档
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览</title>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #app {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="app">
    ${props.code}
  </div>
</body>
</html>`;
});

// 创建Vue项目的可运行HTML
const createVueProjectHTML = (projectData: any) => {
  const appVue = projectData["src/App.vue"] || "";

  // 解析Vue单文件组件
  const templateMatch = appVue.match(/<template>([\s\S]*?)<\/template>/);
  const scriptMatch = appVue.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const styleMatch = appVue.match(/<style[^>]*>([\s\S]*?)<\/style>/);

  const template = templateMatch ? templateMatch[1].trim() : '<div>Vue组件模板解析失败</div>';
  const script = scriptMatch ? scriptMatch[1].trim() : '';
  const style = styleMatch ? styleMatch[1].trim() : '';

  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue3 项目预览</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <script src="https://unpkg.com/element-plus/dist/index.full.js"><\/script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #app {
      width: 100%;
      min-height: 100vh;
    }
    ${style}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const { createApp } = Vue;
    const { ElMessage, ElButton, ElCard, ElContainer, ElHeader, ElMain } = ElementPlus;
    
    const App = {
      template: \`${template}\`,
      setup() {
        const showMessage = () => {
          ElMessage.success('Hello from Vue3!');
        };
        
        return { showMessage };
      }
    };
    
    const app = createApp(App);
    app.use(ElementPlus);
    app.mount('#app');
  <\/script>
</body>
</html>`;

  return htmlContent;
};

const refreshPreview = () => {
  if (previewFrame.value) {
    previewFrame.value.src = previewFrame.value.src;
    ElMessage.success("预览已刷新");
  }
};

const openInNewTab = () => {
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.write(processedCode.value);
    newWindow.document.close();
  }
};

const onPreviewLoad = () => {
  console.log("预览加载完成");
};
</script>

<style scoped>
.preview-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  height: calc(100% - 49px);
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #fff;
}

/* 空状态样式 */
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}
</style>
