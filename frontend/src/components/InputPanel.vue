<template>
    <div class="input-card-container">
        <!-- 标题区域 -->
        <div class="panel-header">
            <el-icon class="header-icon">
                <MagicStick />
            </el-icon>
            <h2 class="panel-title">AI 设计助手</h2>
        </div>

        <div class="card-content">
            <!-- 选择输入方式 -->
            <div class="section">
                <h3 class="section-title">选择输入方式</h3>
                <div class="input-method-selector">
                    <div class="method-button" :class="{ active: codeStore.inputMethod === 'text' }"
                        @click="codeStore.inputMethod = 'text'">
                        <el-icon class="method-icon">
                            <ChatDotRound />
                        </el-icon>
                        <span>自然语言</span>
                    </div>
                    <div class="method-button" :class="{ active: codeStore.inputMethod === 'import' }"
                        @click="codeStore.inputMethod = 'import'">
                        <el-icon class="method-icon">
                            <FolderOpened />
                        </el-icon>
                        <span>导入HTML</span>
                    </div>
                </div>
            </div>

            <!-- 文字描述输入 -->
            <div v-if="codeStore.inputMethod === 'text'" class="section">
                <el-input v-model="codeStore.userPrompt" type="textarea" :rows="8"
                    placeholder="描述您想要的网页，例如：'创建一个带有导航栏、英雄区域和联系表单的个人作品集网站，使用蓝色主题'" class="description-input"
                    resize="none" />
            </div>

            <!-- 导入HTML文件 -->
            <div v-if="codeStore.inputMethod === 'import'" class="section">
                <div class="import-header">
                    <h3 class="section-title">导入本地JSON文件</h3>
                    <div class="import-buttons">
                        <el-button @click="loadDefaultDirectoryFiles" :loading="codeStore.isLoadingFiles" size="small"
                            style="margin-right: 8px">
                            <el-icon>
                                <FolderOpened />
                            </el-icon>
                            加载默认目录
                        </el-button>
                        <el-button @click="selectLocalFile" size="small">
                            <el-icon>
                                <Document />
                            </el-icon>
                            选择文件
                        </el-button>
                    </div>
                </div>

                <!-- 隐藏的文件输入元素 -->
                <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileSelect" />

                <div class="import-tip">
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                    <span>选择本地JSON文件直接导入HTML内容</span>
                </div>

                <div v-if="codeStore.isLoadingFiles" class="import-loading">
                    <el-icon class="loading-icon">
                        <Loading />
                    </el-icon>
                    <span>加载中...</span>
                </div>

                <div v-else-if="selectedFileName" class="file-preview">
                    <div class="file-item selected">
                        <div class="file-info">
                            <div class="file-name">{{ selectedFileName }}</div>
                            <div class="file-meta">
                                <span>{{ selectedFileSize }}</span>
                                <span>{{ formatDate(new Date().toISOString()) }}</span>
                            </div>
                            <div class="file-description">
                                已选择本地文件，点击下方按钮确认导入
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 默认目录文件列表 -->
                <div v-if="showDefaultDirectoryFiles && defaultDirectoryFiles.length > 0" class="default-files-section">
                    <div class="section-title" style="margin-bottom: 16px;">默认目录文件</div>
                    <div class="file-list">
                        <div v-for="file in defaultDirectoryFiles" :key="file.filename" class="file-item"
                            :class="{ selected: selectedFileName === file.filename }"
                            @click="selectFileFromDefaultDirectory(file)">
                            <div class="file-info">
                                <div class="file-name">{{ file.filename }}</div>
                                <div class="file-meta">
                                    <span>{{ file.size ? formatFileSize(file.size) : '未知大小' }}</span>
                                    <span>{{ file.created ? formatDate(file.created) : '未知时间' }}</span>
                                </div>
                                <div v-if="file.metadata?.description" class="file-description">
                                    {{ file.metadata.description }}
                                </div>
                            </div>
                            <div class="file-actions">
                                <el-tag v-if="file.metadata?.aiGenerated" type="success" size="small">AI生成</el-tag>
                                <el-tag v-else type="info" size="small">默认模板</el-tag>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state">
                    <el-icon class="empty-icon">
                        <FolderOpened />
                    </el-icon>
                    <p>请选择要导入的JSON文件</p>
                    <p class="empty-hint">点击上方的"加载默认目录"按钮或"选择文件"按钮导入文件</p>
                </div>
            </div>

            <!-- 高级选项已默认启用 -->
            <div v-if="codeStore.inputMethod === 'text'" class="section hidden-advanced-options"></div>

            <!-- 生成/导入按钮 -->
            <div class="section">
                <el-button v-if="codeStore.inputMethod === 'import'" type="primary" size="large"
                    @click="importSelectedFile" :disabled="!selectedFileName" class="generate-btn">
                    <el-icon>
                        <FolderOpened />
                    </el-icon>
                    {{ selectedFileName ? '确认使用此HTML文件' : '请先选择HTML文件' }}
                </el-button>
                <el-button v-else type="primary" size="large" :loading="codeStore.isGenerating"
                    @click="$emit('generate')" :disabled="!codeStore.canGenerate" class="generate-btn">
                    <el-icon v-if="!codeStore.isGenerating">
                        <MagicStick />
                    </el-icon>
                    {{ codeStore.isGenerating ? "生成中..." : "生成HTML" }}
                </el-button>
            </div>

            <!-- 生成进度显示 -->
            <div v-if="codeStore.showProgress" class="progress-section">
                <div class="progress-info">
                    <div class="progress-status">{{ codeStore.generateStatus }}</div>
                    <el-progress :percentage="codeStore.generateProgress" :show-text="true" :stroke-width="8"
                        :color="codeStore.generateProgress === 100 ? '#67c23a' : '#409eff'" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import {
    MagicStick,
    ChatDotRound,
    FolderOpened,
    Loading,
    InfoFilled,
    Document
} from "@element-plus/icons-vue"
import { useCodeStore } from '@/stores/code'
import { ref, watch, onMounted } from 'vue'

const codeStore = useCodeStore()

defineEmits<{
    'generate': []
}>()

// 选择本地文件
const fileInput = ref<HTMLInputElement>()
const selectedFileName = ref('')
const selectedFileSize = ref('')
let selectedFileContent: any = null
const defaultDirectoryFiles = ref<any[]>([])
const showDefaultDirectoryFiles = ref(false)

// 打开文件选择对话框
const selectLocalFile = () => {
    fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
        const file = input.files[0]
        selectedFileName.value = file.name
        selectedFileSize.value = formatFileSize(file.size)

        codeStore.isLoadingFiles = true

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                if (e.target?.result) {
                    selectedFileContent = JSON.parse(e.target.result as string)

                    // 预览文件内容
                    // 处理不同的文件格式
                    let codeToImport = selectedFileContent

                    // 如果文件包含metadata和code结构，只使用code部分
                    if (selectedFileContent && typeof selectedFileContent === 'object' && selectedFileContent.code) {
                        codeToImport = selectedFileContent.code
                        console.log('Using code section from structured file')
                    }

                    // 将内容传递给代码编辑器
                    codeStore.setGeneratedCode(codeToImport)
                    codeStore.isGenerated = true
                    ElMessage.success(`已预览文件: ${file.name}`)
                }
            } catch (error) {
                console.error('解析文件失败:', error)
                ElMessage.error('文件格式无效，请选择有效的JSON文件')
                selectedFileName.value = ''
                selectedFileSize.value = ''
                selectedFileContent = null
            } finally {
                codeStore.isLoadingFiles = false
            }
        }
        reader.onerror = () => {
            console.error('读取文件失败')
            ElMessage.error('读取文件失败')
            codeStore.isLoadingFiles = false
        }
        reader.readAsText(file)

        // 重置input，允许重复选择同一个文件
        input.value = ''
    }
}

// 加载默认目录的文件列表
const loadDefaultDirectoryFiles = async () => {
    try {
        codeStore.isLoadingFiles = true
        // 注意：由于浏览器安全限制，我们不能直接访问本地文件系统路径
        // 这里我们模拟加载默认目录的文件列表
        // 实际项目中，这需要后端API支持
        const response = await fetch('http://localhost:3000/api/import/json-files')
        const data = await response.json()

        if (data.success) {
            defaultDirectoryFiles.value = data.files
            showDefaultDirectoryFiles.value = true
            ElMessage.success(`加载了 ${data.files.length} 个默认目录文件`)
        } else {
            ElMessage.error('加载默认目录文件失败')
        }
    } catch (error) {
        console.error('加载默认目录文件失败:', error)
        ElMessage.error('加载默认目录文件失败，请确保后端服务已启动')
    } finally {
        codeStore.isLoadingFiles = false
    }
}

// 从默认目录选择文件
const selectFileFromDefaultDirectory = async (file: any) => {
    try {
        codeStore.isLoadingFiles = true
        const response = await fetch(`http://localhost:3000/api/import/file-content/${file.filename}`)
        const data = await response.json()

        if (data.success) {
            selectedFileName.value = file.filename
            selectedFileSize.value = formatFileSize(0) // 由于没有实际文件大小信息，我们设为0
            selectedFileContent = data.content

            // 处理不同的文件格式
            let codeToImport = data.content

            // 如果文件包含metadata和code结构，只使用code部分
            if (data.content && typeof data.content === 'object' && data.content.code) {
                codeToImport = data.content.code
                console.log('Using code section from structured file')
            }

            // 将内容传递给代码编辑器
            codeStore.setGeneratedCode(codeToImport)
            codeStore.isGenerated = true
            ElMessage.success(`已预览文件: ${file.filename}`)
        } else {
            ElMessage.error('加载文件预览失败: ' + data.error)
        }
    } catch (error) {
        console.error('加载文件预览失败:', error)
        ElMessage.error('加载文件预览失败')
    } finally {
        codeStore.isLoadingFiles = false
    }
}

// 确认导入选中的文件
const importSelectedFile = () => {
    if (!selectedFileContent) {
        ElMessage.warning('请先选择要导入的JSON文件')
        return
    }

    console.log('===== 导入文件处理 =====')
    console.log('文件名:', selectedFileName.value)
    console.log('原始内容类型:', typeof selectedFileContent)
    console.log('原始内容预览:', typeof selectedFileContent === 'string' ?
        (selectedFileContent.length > 100 ? selectedFileContent.substring(0, 100) + '...' : selectedFileContent) :
        JSON.stringify(selectedFileContent).substring(0, 100) + '...')

    // 处理导入的内容，确保提取code部分
    let codeToImport = selectedFileContent

    // 如果内容是对象且包含code字段，只使用code部分
    if (selectedFileContent && typeof selectedFileContent === 'object' && selectedFileContent.code) {
        console.log('检测到对象有code字段，提取前类型:', typeof selectedFileContent.code)
        codeToImport = selectedFileContent.code
        console.log('提取后code类型:', typeof codeToImport)
    }
    // 如果内容是字符串，尝试解析为JSON对象
    else if (typeof selectedFileContent === 'string') {
        try {
            const parsedContent = JSON.parse(selectedFileContent)
            if (parsedContent && typeof parsedContent === 'object' && parsedContent.code) {
                console.log('字符串解析为JSON对象并提取code字段')
                codeToImport = parsedContent.code
            }
        } catch (e) {
            console.log('字符串不是有效的JSON格式，直接使用')
            // 不是有效的JSON，直接使用字符串内容
        }
    }

    console.log('传递给setGeneratedCode的最终类型:', typeof codeToImport)
    console.log('最终内容长度:', typeof codeToImport === 'string' ? codeToImport.length : JSON.stringify(codeToImport).length)
    console.log('======================')

    // 将处理后的内容传递给代码编辑器
    codeStore.setGeneratedCode(codeToImport)
    codeStore.isGenerated = true
    ElMessage.success(`JSON文件 "${selectedFileName.value}" 导入成功！`)
}

// 组件挂载时自动加载默认目录文件
// 这将确保用户一进入页面就能看到默认目录中的文件
onMounted(() => {
    loadDefaultDirectoryFiles()
})

// 格式化文件大小
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 监听导入模式变化，重置选择状态
watch(() => codeStore.inputMethod, (newMethod) => {
    if (newMethod === 'import') {
        selectedFileName.value = ''
        selectedFileSize.value = ''
        selectedFileContent = null
    }
}, { immediate: true })
</script>

<style scoped>
.input-card-container {
    background: white;
    margin: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f2f5;
    overflow: hidden;
    transition: all 0.3s ease;
}

.input-card-container:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.panel-header {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    padding: 20px 24px 10px 24px;
    border-bottom: 1px solid #f0f2f5;
}

.card-content {
    padding: 24px;
    height: calc(100% - 80px);
    overflow-y: auto;
}

.header-icon {
    color: #667eea;
    font-size: 24px;
    margin-right: 12px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.panel-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1a202c;
    background: linear-gradient(45deg, #2d3748, #4a5568);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section {
    margin-bottom: 30px;
    padding: 20px 0;
    border-bottom: 1px solid #f0f2f5;
}

.section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 16px;
    position: relative;
    padding-left: 12px;
}

.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
}

.input-method-selector {
    display: flex;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #f8f9fa;
    padding: 4px;
}

.method-button {
    flex: 1;
    padding: 12px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
    color: #6b7280;
}

.method-button:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.method-button.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.method-icon {
    font-size: 16px;
}

.description-input {
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.6;
}

.description-input :deep(.el-textarea__inner) {
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
    resize: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.description-input :deep(.el-textarea__inner):focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.generate-btn {
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.generate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.generate-btn:disabled {
    background: #d1d5db;
    transform: none;
    box-shadow: none;
}

.demo-btn {
    background: linear-gradient(45deg, #10B981, #059669) !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
    height: 50px;
}

.demo-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
}

/* 隐藏的高级选项 */
.hidden-advanced-options {
    display: none;
}

/* 进度条样式 */
.progress-section {
    margin-top: 24px;
    padding: 20px;
    background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
    border-radius: 12px;
    border: 1px solid #e0e7ff;
}

.progress-info {
    text-align: center;
}

.progress-status {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 16px;
    padding: 8px 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 导入界面样式 */
.import-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.import-buttons {
    display: flex;
    gap: 8px;
}

.default-files-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f0f2f5;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
}

.empty-icon {
    font-size: 48px;
    color: #d1d5db;
    margin-bottom: 16px;
}

.empty-hint {
    font-size: 14px;
    color: #9ca3af;
    margin-top: 8px;
}

.file-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.file-item {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.file-item:hover {
    background: #f9fafb;
}

.file-item:last-child {
    border-bottom: none;
}

.file-item.selected {
    background: #eff6ff;
    border-color: #3b82f6;
    box-shadow: inset 0 0 0 1px #3b82f6;
}

.file-info {
    flex: 1;
}

.file-name {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
}

.file-meta {
    font-size: 12px;
    color: #6b7280;
    display: flex;
    gap: 12px;
}

.file-description {
    font-size: 13px;
    color: #4b5563;
    margin-top: 4px;
    line-height: 1.4;
}

.file-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.import-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    color: #6b7280;
}

.loading-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.import-title {
    font-weight: 600;
    color: #374151;
}

.import-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f0f9ff;
    border: 1px solid #e0f2fe;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #0369a1;
}

.import-tip .el-icon {
    color: #0284c7;
}
</style>
