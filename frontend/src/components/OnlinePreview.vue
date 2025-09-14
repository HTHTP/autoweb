<template>
    <div class="online-preview-container">
        <div class="preview-header">
            <span class="preview-title">在线实时预览</span>
            <div class="preview-actions">
                <el-button size="small" @click="compileAndPreview" :disabled="!hasCode" :loading="compiling">
                    <el-icon>
                        <Refresh />
                    </el-icon>
                    {{ compiling ? '编译中' : '刷新' }}
                </el-button>
                <el-button size="small" @click="openInNewWindow" :disabled="!hasCode">
                    <el-icon>
                        <Link />
                    </el-icon>
                    新窗口
                </el-button>
            </div>
        </div>

        <div class="preview-content">
            <!-- 编译错误显示 -->
            <div v-if="compileErrors.length > 0" class="error-panel">
                <div class="error-header">
                    <el-icon class="error-icon">
                        <WarningFilled />
                    </el-icon>
                    编译错误 ({{ compileErrors.length }})
                </div>
                <div class="error-list">
                    <div v-for="(error, index) in compileErrors" :key="index" class="error-item">
                        {{ error }}
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!hasCode" class="preview-empty">
                <div class="empty-icon">🚀</div>
                <h3 class="empty-title">在线实时编译预览</h3>
                <p class="empty-description">
                    支持Vue3单文件组件实时编译<br />
                    类似CodeSandbox的浏览器内编译体验<br />
                    无需服务器，即时预览您的代码
                </p>
            </div>

            <!-- 预览iframe -->
            <iframe v-else ref="previewFrame" :src="previewUrl" class="preview-iframe"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                @load="handleFrameLoad"></iframe>
        </div>

        <!-- 加载遮罩 -->
        <div v-if="compiling" class="compile-overlay">
            <div class="compile-spinner">
                <el-icon class="rotating">
                    <Loading />
                </el-icon>
                <p>正在编译...</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Link, WarningFilled, Loading } from '@element-plus/icons-vue'

interface Props {
    code: string
}

const props = defineProps<Props>()

// 响应式状态
const compiling = ref(false)
const compileErrors = ref<string[]>([])
const previewFrame = ref<HTMLIFrameElement>()
const previewUrl = ref('')

// 计算属性
const hasCode = computed(() => Boolean(props.code && props.code.trim()))

// 编译并预览
const compileAndPreview = async () => {
    if (!hasCode.value || compiling.value) return

    compiling.value = true
    compileErrors.value = []

    try {
        console.log('开始在线编译...', '代码长度:', props.code.length)

        // 简化的HTML生成
        const htmlContent = createSimplePreviewHTML(props.code)
        console.log('生成的HTML长度:', htmlContent.length)

        // 创建Blob URL
        const blob = new Blob([htmlContent], { type: 'text/html' })

        // 清理旧的URL
        if (previewUrl.value.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl.value)
        }

        previewUrl.value = URL.createObjectURL(blob)
        console.log('编译完成，预览URL已生成:', previewUrl.value)
    } catch (error) {
        console.error('编译失败:', error)
        compileErrors.value = [(error as Error).message]
        ElMessage.error('编译失败: ' + (error as Error).message)
    } finally {
        compiling.value = false
    }
}

// 监听代码变化，自动编译
watch(
    () => props.code,
    (newCode) => {
        console.log('检测到代码变化:', newCode ? `长度${newCode.length}` : '无代码')
        if (newCode && newCode.trim()) {
            // 防抖延迟编译
            setTimeout(() => {
                compileAndPreview()
            }, 500)
        }
    },
    { immediate: true }
)

// 组件挂载时立即编译
onMounted(() => {
    console.log('OnlinePreview组件已挂载，props.code:', props.code ? `长度${props.code.length}` : '无代码')
    if (hasCode.value) {
        compileAndPreview()
    }
})

// 创建简单的预览HTML
const createSimplePreviewHTML = (code: string): string => {
    console.log('开始处理代码:', code.substring(0, 200) + '...')

    // 尝试解析为项目结构
    let projectFiles: Record<string, string> = {}
    let isJsonProject = false

    try {
        const parsed = JSON.parse(code)
        if (typeof parsed === 'object' && parsed !== null) {
            projectFiles = parsed
            isJsonProject = true
            console.log('解析为JSON项目，文件数量:', Object.keys(projectFiles).length)
        }
    } catch {
        console.log('不是JSON格式，当作单文件处理')
        // 不是JSON，当作单个文件处理
        if (code.includes('<template>') && code.includes('<script>')) {
            projectFiles = { 'App.vue': code }
            console.log('识别为Vue单文件组件')
        } else if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
            console.log('识别为HTML文件')
            return code // 直接返回完整HTML
        } else {
            projectFiles = { 'index.html': code }
            console.log('当作普通HTML内容处理')
        }
    }

    // 查找主要文件
    const vueFiles = Object.keys(projectFiles).filter(f => f.endsWith('.vue'))
    const htmlFiles = Object.keys(projectFiles).filter(f => f.endsWith('.html'))

    let mainContent = ''

    if (vueFiles.length > 0) {
        console.log('处理Vue文件:', vueFiles)
        // Vue应用模式
        const appFile = vueFiles.find(f => f.includes('App.vue')) || vueFiles[0]
        const vueContent = projectFiles[appFile]

        // 简单的Vue解析（提取template部分）
        const templateMatch = vueContent.match(/<template>([\s\S]*?)<\/template>/)
        const template = templateMatch ? templateMatch[1] : '<div>无法解析Vue模板</div>'

        mainContent = template.trim()
        console.log('提取的模板内容:', mainContent.substring(0, 100) + '...')
    } else if (htmlFiles.length > 0 && isJsonProject) {
        console.log('处理HTML文件:', htmlFiles)
        // HTML模式
        const htmlFile = htmlFiles[0]
        const htmlContent = projectFiles[htmlFile]

        if (htmlContent.includes('<!DOCTYPE html>')) {
            return htmlContent // 返回完整HTML
        }
        mainContent = htmlContent
    } else {
        console.log('使用默认内容')
        mainContent = '<div style="padding: 20px; text-align: center;"><h2>无法识别的代码格式</h2><p>请检查代码格式是否正确</p></div>'
    }

    // 如果是完整HTML，直接返回
    if (mainContent.includes('<!DOCTYPE html>')) {
        console.log('返回完整HTML文档')
        return mainContent
    }

    // 否则包装成完整HTML
    console.log('包装为完整HTML文档')
    const htmlParts = [
        '<!DOCTYPE html>',
        '<html lang="zh-CN">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>在线预览</title>',
        '  <link rel="stylesheet" href="https://unpkg.com/element-plus@2.4.0/dist/index.css">',
        '  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></' + 'script>',
        '  <script src="https://unpkg.com/element-plus@2.4.0/dist/index.full.js"></' + 'script>',
        '  <style>',
        '    body {',
        '      margin: 0;',
        '      padding: 20px;',
        '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        '    }',
        '    #app {',
        '      width: 100%;',
        '      min-height: 100vh;',
        '    }',
        '  </style>',
        '</' + 'head>',
        '<body>',
        '  <div id="app">',
        '    ' + mainContent,
        '  </div>',
        '  ',
        '  <script>',
        '    try {',
        '      console.log("Vue version:", Vue.version)',
        '      const { createApp } = Vue',
        '      const app = createApp({})',
        '      if (typeof ElementPlus !== "undefined") {',
        '        app.use(ElementPlus)',
        '        console.log("ElementPlus loaded successfully")',
        '      }',
        '      app.mount("#app")',
        '      console.log("Vue app mounted successfully")',
        '    } catch (error) {',
        '      console.error("App initialization failed:", error)',
        '      document.getElementById("app").innerHTML = "<div style=\\"color: red; padding: 20px;\\">应用初始化失败: " + error.message + "</div>"',
        '    }',
        '  </' + 'script>',
        '</' + 'body>',
        '</' + 'html>'
    ]

    const result = htmlParts.join('\n')
    console.log('最终生成的HTML长度:', result.length)
    return result
}

// 在新窗口打开
const openInNewWindow = () => {
    if (previewUrl.value) {
        window.open(previewUrl.value, '_blank')
    }
}

// iframe加载完成
const handleFrameLoad = () => {
    console.log('预览iframe加载完成')
}
</script>

<style scoped>
.online-preview-container {
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
    background: #fff;
    position: relative;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: 1px solid #dcdfe6;
    color: white;
}

.preview-title {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.preview-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.preview-content {
    height: calc(100% - 57px);
    position: relative;
}

.preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #fff;
}

/* 错误面板 */
.error-panel {
    height: 100%;
    background: #fef0f0;
    border: 1px solid #fbc4c4;
    overflow-y: auto;
}

.error-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f56c6c;
    color: white;
    font-weight: 600;
    font-size: 14px;
}

.error-icon {
    font-size: 16px;
}

.error-list {
    padding: 0;
}

.error-item {
    padding: 12px 16px;
    border-bottom: 1px solid #fbc4c4;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    color: #e74c3c;
    white-space: pre-wrap;
    word-break: break-word;
}

.error-item:last-child {
    border-bottom: none;
}

/* 空状态 */
.preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
    padding: 40px 20px;
    text-align: center;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    animation: bounce 2s infinite;
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-10px);
    }

    60% {
        transform: translateY(-5px);
    }
}

.empty-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 16px 0;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.empty-description {
    font-size: 16px;
    color: #64748b;
    line-height: 1.6;
    margin: 0;
}

/* 编译遮罩 */
.compile-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.compile-spinner {
    text-align: center;
    color: #667eea;
}

.compile-spinner .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.compile-spinner p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>

<style scoped>
.online-preview-container {
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
    background: #fff;
    position: relative;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: 1px solid #dcdfe6;
    color: white;
}

.preview-title {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.preview-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.preview-content {
    height: calc(100% - 57px);
    position: relative;
}

.preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #fff;
}

/* 错误面板 */
.error-panel {
    height: 100%;
    background: #fef0f0;
    border: 1px solid #fbc4c4;
    overflow-y: auto;
}

.error-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f56c6c;
    color: white;
    font-weight: 600;
    font-size: 14px;
}

.error-icon {
    font-size: 16px;
}

.error-list {
    padding: 0;
}

.error-item {
    padding: 12px 16px;
    border-bottom: 1px solid #fbc4c4;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    color: #e74c3c;
    white-space: pre-wrap;
    word-break: break-word;
}

.error-item:last-child {
    border-bottom: none;
}

/* 空状态 */
.preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
    padding: 40px 20px;
    text-align: center;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    animation: bounce 2s infinite;
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-10px);
    }

    60% {
        transform: translateY(-5px);
    }
}

.empty-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 16px 0;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.empty-description {
    font-size: 16px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 30px 0;
    max-width: 400px;
}

.feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 300px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #475569;
    font-weight: 500;
}

.feature-item .el-icon {
    color: #10b981;
    font-size: 16px;
}

/* 编译遮罩 */
.compile-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.compile-spinner {
    text-align: center;
    color: #667eea;
}

.compile-spinner .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.compile-spinner p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .preview-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .preview-actions {
        justify-content: center;
    }

    .feature-list {
        grid-template-columns: 1fr;
    }
}
</style>