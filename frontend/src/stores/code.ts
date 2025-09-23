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
  const useChunkedOutput = ref(true) // 是否使用分块生成（续写模式）
  const useDeepThinking = ref(true) // 是否使用深度思考模式
  
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

    // 尝试解析JSON格式
    try {
      const jsonData = JSON.parse(generatedCode.value)
      
      // 如果解析成功是对象且有code字段，使用code字段
      if (typeof jsonData === 'object' && jsonData !== null && jsonData.code && typeof jsonData.code === 'string') {
        console.log('从JSON中提取code字段内容')
        return jsonData.code
      }
      // 如果解析成功是字符串，直接返回
      else if (typeof jsonData === 'string') {
        console.log('解析成功为字符串，直接返回')
        return jsonData
      }
      // 其他情况，将解析后的内容转为字符串
      else {
        console.log('解析成功但不是预期格式，转为字符串')
        return String(jsonData)
      }
    } catch (e) {
      console.log('不是有效的JSON格式，直接使用原始字符串')
      // 如果不是有效的JSON，直接返回原始字符串（这可能是HTML代码）
      return generatedCode.value
    }
  })

  // 可编辑的HTML代码（用于代码编辑器）
  const editableHtmlCode = ref('')
  
  // 是否正在手动更新HTML（防止watch循环触发）
  const isManualUpdate = ref(false)
  
  // 监听提取的HTML变化，同步到可编辑版本
  watch(extractedHtmlCode, (newHtml: string) => {
    if (!isManualUpdate.value) {
      editableHtmlCode.value = newHtml
    }
  }, { immediate: true })

  // 更新HTML代码的方法
  const updateHtmlCode = (newHtml: string) => {
    isManualUpdate.value = true
    editableHtmlCode.value = newHtml
    // 创建包含code字段的JSON对象
    const jsonWithCode = {
      code: newHtml
    }
    // 更新generatedCode为包含code字段的JSON字符串
    generatedCode.value = JSON.stringify(jsonWithCode, null, 2)
    // 重置标志
    setTimeout(() => {
      isManualUpdate.value = false
    }, 0)
  }

  // 应用初始化时加载默认HTML模板
  const defaultHtmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的HTML页面</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <h1>欢迎使用HTML编辑器</h1>
  <p>请在此输入或编辑您的HTML代码</p>
</body>
</html>`

  // 注释掉自动加载默认模板，让用户点击"加载演示代码"按钮后才加载
  // updateHtmlCode(defaultHtmlTemplate)

  // 创建完整HTML文档的辅助函数（保留以备将来使用）
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

  // 使用一次该函数以避免未使用警告
  // @ts-ignore - 故意保留但不实际使用
  createHtmlFromTemplate('')

  // 方法
  const setGeneratedCode = (code: string | object) => {
    let codeString = ''
    
    console.log('===== 导入调试信息 =====')
    console.log('原始输入类型:', typeof code)
    console.log('原始输入内容预览:', typeof code === 'string' ? (code.length > 100 ? code.substring(0, 100) + '...' : code) : JSON.stringify(code).substring(0, 100) + '...')
    
    if (typeof code === 'string') {
      // 如果是字符串，检查是否已经是JSON格式的字符串
      try {
        const parsed = JSON.parse(code)
        // 如果是JSON对象且有code字段，直接使用code字段
        if (typeof parsed === 'object' && parsed !== null && 'code' in parsed) {
          codeString = typeof (parsed as any).code === 'string' ? (parsed as any).code : String((parsed as any).code)
          console.log('检测到JSON字符串，已提取code字段')
        } else {
          codeString = code
          console.log('使用原始字符串')
        }
      } catch (e) {
        // 不是JSON字符串，直接使用
        codeString = code
        console.log('不是JSON字符串，直接使用')
      }
    } else if (typeof code === 'object' && code !== null) {
      // 如果是对象且有code字段，直接使用code字段
      if ('code' in code) {
        codeString = typeof (code as any).code === 'string' ? (code as any).code : String((code as any).code)
        console.log('检测到对象有code字段，已提取')
      } else {
        // 否则序列化整个对象
        codeString = JSON.stringify(code, null, 2)
        console.log('对象没有code字段，已序列化为JSON字符串')
      }
    } else {
      codeString = String(code || '')
      console.log('转换为字符串')
    }
    
    console.log('最终使用的代码长度:', codeString.length)
    console.log('最终代码预览:', codeString.substring(0, 100) + (codeString.length > 100 ? '...' : ''))
    console.log('======================')
    
    generatedCode.value = codeString
    activeTab.value = 'code'
  }
  
  // 追加生成的代码块（用于流式输出）
  const appendGeneratedCode = (chunk: string) => {
    if (!chunk) return
    
    // 记录追加前的长度，用于调试
    const prevLength = generatedCode.value.length
    
    // 追加新内容到generatedCode
    generatedCode.value += chunk
    
    // 检查是否是第一次追加，如果是，设置生成状态为true
    if (!isGenerated.value && generatedCode.value.trim().length > 0) {
      isGenerated.value = true
    }
    
    // 直接追加到可编辑HTML代码
    isManualUpdate.value = true
    editableHtmlCode.value += chunk
    setTimeout(() => {
      isManualUpdate.value = false
    }, 0)
    
    // 输出调试信息
    console.log(`追加代码块，从${prevLength}字符增加到${generatedCode.value.length}字符`)
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
    // 保留最小占位符JSON对象，确保编辑界面不会切换到空状态
    generatedCode.value = '{"code":""}'
    modificationText.value = ''
    generateProgress.value = 0
    generateStatus.value = ''
    showProgress.value = false
    isGenerated.value = false
    
    // 直接清空可编辑HTML代码，确保编辑器完全清空
    isManualUpdate.value = true
    editableHtmlCode.value = ''
    setTimeout(() => {
      isManualUpdate.value = false
    }, 0)
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
    useChunkedOutput,
    useDeepThinking,
    
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
    updateHtmlCode,
    appendGeneratedCode
  }
})
