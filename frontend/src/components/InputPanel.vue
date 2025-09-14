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
                    <div class="method-button" :class="{ active: codeStore.inputMethod === 'sketch' }"
                        @click="codeStore.inputMethod = 'sketch'">
                        <el-icon class="method-icon">
                            <Edit />
                        </el-icon>
                        <span>草图上传</span>
                    </div>
                    <div class="method-button" :class="{ active: codeStore.inputMethod === 'import' }"
                        @click="codeStore.inputMethod = 'import'">
                        <el-icon class="method-icon">
                            <FolderOpened />
                        </el-icon>
                        <span>导入项目</span>
                    </div>
                </div>
            </div>

            <!-- 文字描述输入 -->
            <div v-if="codeStore.inputMethod === 'text'" class="section">
                <el-input v-model="codeStore.userPrompt" type="textarea" :rows="8"
                    placeholder="描述您想要的网页，例如：'创建一个带有导航栏、英雄区域和联系表单的个人作品集网站，使用蓝色主题'" class="description-input"
                    resize="none" />
            </div>

            <!-- 草图上传 -->
            <div v-if="codeStore.inputMethod === 'sketch'" class="section">
                <el-upload class="sketch-uploader" drag :auto-upload="false" :on-change="handleSketchUpload"
                    accept="image/*" :show-file-list="false">
                    <el-icon class="upload-icon">
                        <Upload />
                    </el-icon>
                    <div class="upload-text">
                        <p>拖放草图图片到此处或点击上传</p>
                        <p class="upload-hint">支持 PNG, JPG 格式 (最大 10MB)</p>
                    </div>
                </el-upload>
            </div>

            <!-- 导入项目 -->
            <div v-if="codeStore.inputMethod === 'import'" class="section">
                <div class="import-header">
                    <span class="import-title">选择要导入的项目</span>
                    <el-button @click="loadAvailableFiles" :loading="codeStore.isLoadingFiles" size="small">
                        刷新列表
                    </el-button>
                </div>

                <div class="import-tip">
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                    <span>点击项目文件可在右侧预览内容，确认后点击下方按钮导入</span>
                </div>

                <div v-if="codeStore.isLoadingFiles" class="import-loading">
                    <el-icon class="loading-icon">
                        <Loading />
                    </el-icon>
                    <span>加载中...</span>
                </div>

                <div v-else-if="codeStore.availableFiles.length === 0" class="empty-state">
                    <el-icon class="empty-icon">
                        <FolderOpened />
                    </el-icon>
                    <p>暂无可导入的项目</p>
                    <p class="empty-hint">生成新项目后可在此导入使用</p>
                </div>

                <div v-else class="file-list">
                    <div v-for="file in codeStore.availableFiles" :key="file.filename" class="file-item"
                        :class="{ selected: codeStore.selectedFile === file.filename }"
                        @click="selectFile(file.filename)">
                        <div class="file-info">
                            <div class="file-name">{{ file.filename }}</div>
                            <div class="file-meta">
                                <span>{{ formatFileSize(file.size) }}</span>
                                <span>{{ formatDate(file.created) }}</span>
                                <span v-if="file.metadata.fileCount">{{ file.metadata.fileCount }} 个文件</span>
                            </div>
                            <div v-if="file.metadata.description" class="file-description">
                                {{ file.metadata.description }}
                            </div>
                        </div>
                        <div class="file-actions">
                            <el-button size="small" type="primary" v-if="codeStore.selectedFile === file.filename">
                                预览中
                            </el-button>
                            <el-button size="small" v-else>
                                点击预览
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 导入项目 -->
            <div v-if="codeStore.inputMethod === 'import'" class="section">
                <div class="import-header">
                    <h3 class="section-title">选择已保存的项目</h3>
                    <el-button @click="loadAvailableFiles" :loading="codeStore.isLoadingFiles" size="small">
                        刷新列表
                    </el-button>
                </div>

                <div v-if="codeStore.availableFiles.length === 0 && !codeStore.isLoadingFiles" class="empty-state">
                    <el-icon class="empty-icon">
                        <FolderOpened />
                    </el-icon>
                    <p>暂无已保存的项目</p>
                    <p class="empty-hint">请先生成一些项目，然后就可以在这里导入重用了</p>
                </div>

                <div v-else class="file-list">
                    <div v-for="file in codeStore.availableFiles" :key="file.filename" class="file-item"
                        :class="{ selected: codeStore.selectedFile === file.filename }"
                        @click="selectFile(file.filename)">
                        <div class="file-info">
                            <div class="file-name">{{ file.filename }}</div>
                            <div class="file-meta">
                                <span>{{ formatFileSize(file.size) }}</span>
                                <span>{{ formatDate(file.created) }}</span>
                                <span v-if="file.metadata.fileCount">{{ file.metadata.fileCount }} 个文件</span>
                            </div>
                            <div v-if="file.metadata.description" class="file-description">
                                {{ file.metadata.description }}
                            </div>
                        </div>
                        <div class="file-actions">
                            <el-tag v-if="file.metadata.aiGenerated" type="success" size="small">AI生成</el-tag>
                            <el-tag v-else type="info" size="small">默认模板</el-tag>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 生成/导入按钮 -->
            <div class="section">
                <el-button v-if="codeStore.inputMethod === 'import'" type="primary" size="large"
                    @click="importSelectedFile" :disabled="!codeStore.selectedFile" class="generate-btn">
                    <el-icon>
                        <FolderOpened />
                    </el-icon>
                    {{ codeStore.selectedFile ? '确认使用此项目' : '请先选择项目' }}
                </el-button>
                <el-button v-else type="primary" size="large" :loading="codeStore.isGenerating"
                    @click="$emit('generate')" :disabled="!codeStore.canGenerate" class="generate-btn">
                    <el-icon v-if="!codeStore.isGenerating">
                        <MagicStick />
                    </el-icon>
                    {{ codeStore.isGenerating ? "生成中..." : "生成代码" }}
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
    Edit,
    Upload,
    FolderOpened,
    Loading,
    InfoFilled
} from "@element-plus/icons-vue"
import { useCodeStore } from '@/stores/code'
import { watch } from 'vue'

const codeStore = useCodeStore()

defineEmits<{
    'generate': []
}>()

// 处理草图上传
const handleSketchUpload = (file: any) => {
    console.log("上传的草图:", file)
    ElMessage.info("草图功能开发中，敬请期待！")
}

// 加载可用文件列表
const loadAvailableFiles = async () => {
    try {
        codeStore.isLoadingFiles = true
        const response = await fetch('http://localhost:3000/api/import/json-files')
        const data = await response.json()

        if (data.success) {
            codeStore.availableFiles = data.files
            console.log('加载了', data.files.length, '个文件')
        } else {
            ElMessage.error('加载文件列表失败')
        }
    } catch (error) {
        console.error('加载文件列表失败:', error)
        ElMessage.error('加载文件列表失败')
    } finally {
        codeStore.isLoadingFiles = false
    }
}

// 选择文件并预览
const selectFile = async (filename: string) => {
    codeStore.selectedFile = filename

    // 立即加载并预览文件内容
    try {
        const response = await fetch(`http://localhost:3000/api/import/json-file/${filename}`)
        const data = await response.json()

        if (data.success) {
            // 添加调试信息
            console.log('Import data type:', typeof data.content)
            console.log('Import data preview:', data.content)
            
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
            ElMessage.success(`已预览文件: ${filename}`)
        } else {
            ElMessage.error('加载文件预览失败: ' + data.error)
        }
    } catch (error) {
        console.error('加载文件预览失败:', error)
        ElMessage.error('加载文件预览失败')
    }
}

// 确认导入选中的文件
const importSelectedFile = () => {
    if (!codeStore.selectedFile) {
        ElMessage.warning('请先选择要导入的文件')
        return
    }

    // 内容已经在选择时加载了，这里只需要确认
    ElMessage.success(`项目 "${codeStore.selectedFile}" 导入成功！`)
}

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

// 监听导入模式变化，自动加载文件
watch(() => codeStore.inputMethod, (newMethod) => {
    if (newMethod === 'import' && codeStore.availableFiles.length === 0) {
        loadAvailableFiles()
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

.sketch-uploader {
    width: 100%;
}

.sketch-uploader :deep(.el-upload-dragger) {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background: #fafbfc;
    transition: all 0.3s ease;
    padding: 40px 20px;
}

.sketch-uploader :deep(.el-upload-dragger:hover) {
    border-color: #667eea;
    background: #f8faff;
}

.upload-icon {
    font-size: 48px;
    color: #9ca3af;
    margin-bottom: 16px;
}

.upload-text p {
    margin: 8px 0;
    color: #374151;
    font-weight: 500;
}

.upload-hint {
    color: #9ca3af !important;
    font-size: 12px !important;
    font-weight: normal !important;
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
