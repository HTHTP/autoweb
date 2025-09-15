import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCodeStore = defineStore('code', () => {
  // 状态
  const generatedCode = ref('')
  const isGenerating = ref(false)
  const isGenerated = ref(false)
  const isModifying = ref(false)
  const modificationText = ref('')
  const generateProgress = ref(0)
  const generateStatus = ref('')
  const showProgress = ref(false)
  const activeTab = ref('code')

  // 用户输入相关
  const inputMethod = ref<'text' | 'sketch' | 'import'>('text')
  const userPrompt = ref('')
  
  // 导入相关
  const availableFiles = ref<any[]>([])
  const selectedFile = ref('')
  const isLoadingFiles = ref(false)

  // 计算属性
  const canGenerate = computed(() => {
    if (inputMethod.value === 'text') {
      return userPrompt.value.trim().length > 0
    } else if (inputMethod.value === 'import') {
      return selectedFile.value.length > 0
    }
    return false
  })

  // 提取HTML内容的计算属性
  const extractedHtmlCode = computed(() => {
    if (!generatedCode.value) return ''
    
    // 如果是完整的HTML文档，直接返回
    if (generatedCode.value.includes("<!DOCTYPE html>") || generatedCode.value.includes("<html")) {
      return generatedCode.value
    }

    // 尝试解析JSON格式
    try {
      const jsonData = JSON.parse(generatedCode.value)
      
      // 如果是对象，尝试从中提取HTML文件
      if (typeof jsonData === 'object' && jsonData !== null) {
        // 查找index.html文件
        for (const key in jsonData) {
          if (key.endsWith('index.html') && typeof jsonData[key] === 'string') {
            console.log('从JSON中提取index.html:', key)
            return jsonData[key]
          }
        }
        
        // 查找任何.html文件
        for (const key in jsonData) {
          if (key.endsWith('.html') && typeof jsonData[key] === 'string') {
            console.log('从JSON中提取HTML文件:', key)
            return jsonData[key]
          }
        }
        
        // 如果没有HTML文件，尝试从App.vue中提取template
        for (const key in jsonData) {
          if (key.endsWith('App.vue') && typeof jsonData[key] === 'string') {
            const vueContent = jsonData[key]
            const templateMatch = vueContent.match(/<template>([\s\S]*?)<\/template>/)
            if (templateMatch) {
              console.log('从Vue组件中提取模板')
              // 包装成完整HTML
              return createHtmlFromTemplate(templateMatch[1])
            }
          }
        }
      }
    } catch (e) {
      console.log('不是有效的JSON格式，当作HTML片段处理')
    }

    // 如果都不是，当作HTML片段处理
    return createHtmlFromTemplate(generatedCode.value)
  })

  // 可编辑的HTML代码（用于代码编辑器）
  const editableHtmlCode = ref('')
  
  // 监听提取的HTML变化，同步到可编辑版本
  watch(extractedHtmlCode, (newHtml: string) => {
    editableHtmlCode.value = newHtml
  }, { immediate: true })

  // 更新HTML代码的方法
  const updateHtmlCode = (newHtml: string) => {
    editableHtmlCode.value = newHtml
    // 同时更新原始代码
    generatedCode.value = newHtml
  }

  // 创建完整HTML文档的辅助函数
  const createHtmlFromTemplate = (content: string) => {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>生成的HTML页面</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  ${content.trim()}
</body>
</html>`
  }

  // 方法
  const setGeneratedCode = (code: string | object) => {
    let codeString = ''
    
    if (typeof code === 'string') {
      codeString = code
    } else if (typeof code === 'object' && code !== null) {
      codeString = JSON.stringify(code, null, 2)
    } else {
      codeString = String(code || '')
    }
    
    console.log('setGeneratedCode called with:', typeof code, codeString ? codeString.length : 'null/empty')
    console.log('代码预览:', codeString && typeof codeString.substring === 'function' ? codeString.substring(0, 100) + '...' : 'no preview available')
    generatedCode.value = codeString
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
    const demoHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML演示页面</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .header {
      text-align: center;
      color: white;
      margin-bottom: 50px;
    }
    
    .header h1 {
      font-size: 3em;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .header p {
      font-size: 1.2em;
      opacity: 0.9;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 50px;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .feature-icon {
      font-size: 3em;
      margin-bottom: 20px;
      display: block;
    }
    
    .feature-card h3 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 1.5em;
    }
    
    .cta-section {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    
    .cta-button {
      display: inline-block;
      background: #fff;
      color: #667eea;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 1.1em;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      background: #f8f9ff;
    }
    
    @media (max-width: 768px) {
      .header h1 {
        font-size: 2em;
      }
      
      .features {
        grid-template-columns: 1fr;
      }
      
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>🚀 现代化网站</h1>
      <p>这是一个使用HTML、CSS和JavaScript构建的现代化演示页面</p>
    </header>
    
    <section class="features">
      <div class="feature-card">
        <span class="feature-icon">⚡</span>
        <h3>快速响应</h3>
        <p>优化的性能和快速的加载速度，为用户提供流畅的浏览体验。</p>
      </div>
      
      <div class="feature-card">
        <span class="feature-icon">📱</span>
        <h3>响应式设计</h3>
        <p>完美适配各种设备，从手机到桌面，都能提供最佳的用户体验。</p>
      </div>
      
      <div class="feature-card">
        <span class="feature-icon">🎨</span>
        <h3>现代化界面</h3>
        <p>采用最新的设计理念，简洁美观的界面让用户眼前一亮。</p>
      </div>
    </section>
    
    <section class="cta-section">
      <h2 style="color: white; margin-bottom: 20px;">准备开始了吗？</h2>
      <p style="color: rgba(255,255,255,0.9); margin-bottom: 30px;">
        体验现代化的网站开发，让您的想法变成现实
      </p>
      <a href="#" class="cta-button" onclick="alert('这是一个HTML演示页面！')">
        立即开始
      </a>
    </section>
  </div>
  
  <script>
    // 简单的交互效果
    document.addEventListener('DOMContentLoaded', function() {
      const cards = document.querySelectorAll('.feature-card');
      
      cards.forEach(card => {
        card.addEventListener('click', function() {
          this.style.transform = 'scale(0.95)';
          setTimeout(() => {
            this.style.transform = '';
          }, 150);
        });
      });
      
      console.log('HTML演示页面已加载完成！');
    });
  </script>
</body>
</html>`

    generatedCode.value = demoHTML
    activeTab.value = 'code'
  }

  return {
    // 状态
    generatedCode,
    isGenerating,
    isGenerated,
    isModifying,
    modificationText,
    generateProgress,
    generateStatus,
    showProgress,
    activeTab,
    inputMethod,
    userPrompt,
    availableFiles,
    selectedFile,
    isLoadingFiles,
    editableHtmlCode,
    
    // 计算属性
    canGenerate,
    extractedHtmlCode,
    
    // 方法
    setGeneratedCode,
    setGenerating,
    setModifying,
    setProgress,
    setShowProgress,
    clearCode,
    loadDemoCode,
    updateHtmlCode
  }
})
