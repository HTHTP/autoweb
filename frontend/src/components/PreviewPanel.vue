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
          或点击下方"加载演示代码"按钮，<br />
          生成的网页将在此处实时预览
        </p>
        <div class="debug-info">
          <p>调试信息：接收到的code属性为 {{ props.code || 'null/undefined' }}</p>
        </div>
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
  console.log('===== PreviewPanel 代码处理 =====');
  console.log('接收到的props.code:', props.code ? `类型: ${typeof props.code}, 长度: ${props.code.length}` : 'null/undefined');
  console.log('代码内容预览:', props.code ? props.code.substring(0, 300) + '...' : 'no code');

  if (!props.code) {
    console.log('没有代码，显示空状态');
    return "";
  }

  // 检查是否是项目文件结构的JSON
  try {
    const projectData = JSON.parse(props.code);
    console.log('Parsed project data keys:', Object.keys(projectData));

    // 检查是否包含项目文件结构
    const hasProjectStructure = Object.keys(projectData).some(key =>
      key.includes('/') && (key.endsWith('.vue') || key.endsWith('.js') || key.endsWith('.html'))
    );

    console.log('Has project structure:', hasProjectStructure);

    if (hasProjectStructure) {
      const result = createProjectHTML(projectData);
      console.log('Generated HTML length:', result.length);
      console.log('Generated HTML preview:', result.substring(0, 300) + '...');
      return result;
    }
  } catch (e) {
    console.log('Not JSON format, treating as plain code');
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

// 创建项目的可运行HTML
const createProjectHTML = (projectData: any) => {
  console.log('createProjectHTML called with data:', Object.keys(projectData));

  // 寻找主要的入口文件
  let mainHTML = '';
  let appVue = '';

  // 查找HTML入口文件
  const htmlFiles = Object.keys(projectData).filter(key => key.endsWith('.html'));
  console.log('Found HTML files:', htmlFiles);
  if (htmlFiles.length > 0) {
    mainHTML = projectData[htmlFiles[0]];
  }

  // 查找Vue组件文件
  const vueFiles = Object.keys(projectData).filter(key => key.endsWith('.vue'));
  console.log('Found Vue files:', vueFiles);
  const appVueFile = vueFiles.find(file => file.includes('App.vue'));
  if (appVueFile) {
    appVue = projectData[appVueFile];
    console.log('Found App.vue file:', appVueFile);
  }

  // 如果有Vue组件，优先创建Vue应用（即使有HTML文件）
  if (appVue) {
    console.log('Creating Vue application');
    return createVueAppHTML(appVue, projectData);
  }

  // 如果有完整的HTML文件且没有Vue组件，使用HTML文件
  if (mainHTML && mainHTML.includes('<!DOCTYPE html>')) {
    console.log('Using HTML file directly');
    return mainHTML;
  }

  // 否则创建一个项目文件浏览器
  console.log('Creating project browser');
  return createProjectBrowserHTML(projectData);
};// 创建Vue应用的HTML
const createVueAppHTML = (appVueContent: string, projectData: any) => {
  // 解析Vue单文件组件
  const templateMatch = appVueContent.match(/<template>([\s\S]*?)<\/template>/);
  const styleMatch = appVueContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);

  let template = templateMatch ? templateMatch[1].trim() : '<div>Vue组件模板解析失败</div>';
  let style = styleMatch ? styleMatch[1].trim() : '';

  // 查找HelloWorld组件
  const helloWorldFile = Object.keys(projectData).find(key => key.includes('HelloWorld.vue'));
  let helloWorldComponent = '';

  if (helloWorldFile) {
    const helloWorldContent = projectData[helloWorldFile];
    const hwTemplateMatch = helloWorldContent.match(/<template>([\s\S]*?)<\/template>/);
    const hwStyleMatch = helloWorldContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);

    const hwTemplate = hwTemplateMatch ? hwTemplateMatch[1].trim() : '';
    const hwStyle = hwStyleMatch ? hwStyleMatch[1].trim() : '';

    helloWorldComponent = `
      const HelloWorld = {
        template: \`${hwTemplate}\`,
        props: ['msg'],
        setup(props) {
          return { ...props };
        }
      };
    `;
    style += hwStyle;
  } else {
    // 如果没有HelloWorld组件，但模板中引用了它，需要清理模板
    template = template.replace(/<HelloWorld[^>]*\/?>|<HelloWorld[^>]*>.*?<\/HelloWorld>/g, '<div class="missing-component">HelloWorld组件未找到</div>');
    console.log('清理模板中的HelloWorld引用');
  }

  return `<!DOCTYPE html>
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
    const { createApp, reactive, ref } = Vue;
    const { ElMessage, ElButton, ElCard, ElContainer, ElHeader, ElMain, ElRow, ElCol } = ElementPlus;
    
    ${helloWorldComponent}
    
    const App = {
      template: \`${template}\`,
      ${helloWorldFile ? 'components: { HelloWorld },' : ''}
      setup() {
        // 为组件提供默认数据，避免undefined错误
        const defaultData = reactive({
          // 常见的数据属性默认值
          images: [
            'https://via.placeholder.com/300x200/4CAF50/white?text=Image+1',
            'https://via.placeholder.com/300x200/2196F3/white?text=Image+2',
            'https://via.placeholder.com/300x200/FF9800/white?text=Image+3'
          ],
          price: 1999,
          name: '智能手表 Pro',
          description: '这是一款功能强大的智能手表，具有多种健康监测功能。',
          features: ['心率监测', '睡眠追踪', '运动模式', '防水设计'],
          specifications: {
            display: '1.4英寸 AMOLED',
            battery: '7天续航',
            waterproof: 'IP68',
            connectivity: 'WiFi, 蓝牙5.0'
          },
          currentImage: 0,
          quantity: 1,
          selectedColor: '黑色',
          selectedSize: '42mm',
          colors: ['黑色', '白色', '蓝色'],
          sizes: ['38mm', '42mm', '46mm'],
          tabs: [
            { name: '产品详情', content: '详细的产品介绍内容...' },
            { name: '规格参数', content: '完整的技术规格...' },
            { name: '用户评价', content: '用户使用心得和评价...' }
          ],
          activeTab: '产品详情'
        });
        
        const showMessage = () => {
          ElMessage.success('Hello from Vue3!');
        };
        
        const addToCart = () => {
          ElMessage.success('已添加到购物车！');
        };
        
        const buyNow = () => {
          ElMessage.success('立即购买功能演示');
        };
        
        const selectImage = (index) => {
          defaultData.currentImage = index;
        };
        
        const handleColorChange = (color) => {
          defaultData.selectedColor = color;
        };
        
        const handleSizeChange = (size) => {
          defaultData.selectedSize = size;
        };
        
        const handleTabClick = (tabName) => {
          defaultData.activeTab = tabName;
        };
        
        return { 
          ...defaultData, 
          showMessage, 
          addToCart, 
          buyNow, 
          selectImage,
          handleColorChange,
          handleSizeChange,
          handleTabClick
        };
      }
    };
    
    const app = createApp(App);
    app.use(ElementPlus);
    app.mount('#app');
  <\/script>
</body>
</html>`;
};

// 创建项目文件浏览器HTML
const createProjectBrowserHTML = (projectData: any) => {
  const fileList = Object.keys(projectData).map(filename => {
    const content = projectData[filename];
    const language = getFileLanguage(filename);

    return {
      name: filename,
      content: content,
      language: language
    };
  });

  const fileListHTML = fileList.map((file, index) => `
    <div class="file-item" onclick="showFile(${index})">
      <div class="file-icon">${getFileIcon(file.name)}</div>
      <div class="file-name">${file.name}</div>
    </div>
  `).join('');

  const fileContents = fileList.map(file =>
    `<pre class="file-content"><code class="language-${file.language}">${escapeHtml(file.content)}</code></pre>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>项目文件预览</title>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"><\/script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 300px;
      background: #f5f7fa;
      border-right: 1px solid #dcdfe6;
      overflow-y: auto;
    }
    .sidebar-header {
      padding: 16px;
      background: #409eff;
      color: white;
      font-weight: bold;
    }
    .file-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 1px solid #ebeef5;
    }
    .file-item:hover {
      background: #ecf5ff;
    }
    .file-item.active {
      background: #409eff;
      color: white;
    }
    .file-icon {
      margin-right: 8px;
      font-size: 16px;
    }
    .file-name {
      font-size: 14px;
    }
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    .file-content {
      display: none;
      margin: 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 4px;
      overflow-x: auto;
    }
    .file-content.active {
      display: block;
    }
    .project-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #303133;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="sidebar-header">项目文件</div>
    ${fileListHTML}
  </div>
  <div class="content-area">
    <div class="project-title">项目文件预览</div>
    <div id="file-contents">
      ${fileContents}
    </div>
  </div>
  
  <script>
    let currentFileIndex = 0;
    
    function showFile(index) {
      // 移除所有活动状态
      document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.file-content').forEach(content => content.classList.remove('active'));
      
      // 添加活动状态
      document.querySelectorAll('.file-item')[index].classList.add('active');
      document.querySelectorAll('.file-content')[index].classList.add('active');
      
      currentFileIndex = index;
      
      // 重新高亮代码
      if (window.Prism) {
        Prism.highlightAll();
      }
    }
    
    // 默认显示第一个文件
    if (document.querySelectorAll('.file-item').length > 0) {
      showFile(0);
    }
  <\/script>
</body>
</html>`;
};

// 获取文件类型对应的语言
const getFileLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: { [key: string]: string } = {
    'js': 'javascript',
    'ts': 'typescript',
    'vue': 'markup',
    'html': 'markup',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c'
  };
  return langMap[ext || ''] || 'text';
};

// 获取文件图标
const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconMap: { [key: string]: string } = {
    'js': '📄',
    'ts': '📘',
    'vue': '💚',
    'html': '🌐',
    'css': '🎨',
    'json': '📊',
    'md': '📝',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚡',
    'c': '🔧'
  };
  return iconMap[ext || ''] || '📄';
};

// HTML转义
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
  margin: 0 0 20px 0;
}

.debug-info {
  background: #f0f2f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  word-break: break-all;
}
</style>
