<template>
    <div class="content-container">
        <!-- 空状态 -->
        <div v-if="!codeStore.generatedCode" class="empty-state">
            <div class="empty-content">
                <div class="empty-icon">🎨</div>
                <h3 class="empty-title">开始创建你的专业网页</h3>
                <p class="empty-description">
                    在左侧选择UI框架，描述你的需求，<br />
                    AI将为你生成专业的网页代码
                </p>
                <div class="empty-features">
                    <div class="feature-item">
                        <el-icon class="feature-icon">
                            <MagicStick />
                        </el-icon>
                        <span>AI智能生成</span>
                    </div>
                    <div class="feature-item">
                        <el-icon class="feature-icon">
                            <Edit />
                        </el-icon>
                        <span>实时编辑</span>
                    </div>
                    <div class="feature-item">
                        <el-icon class="feature-icon">
                            <Download />
                        </el-icon>
                        <span>一键导出</span>
                    </div>
                </div>

                <!-- 演示代码按钮 -->
                <div class="demo-actions">
                    <el-button type="success" size="large" @click="$emit('load-demo')" class="demo-btn">
                        <el-icon>
                            <MagicStick />
                        </el-icon>
                        加载演示代码
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 有内容时显示 -->
        <div v-else class="content-wrapper">
            <!-- 修改建议输入 -->
            <div class="modification-section">
                <div class="modification-header">
                    <el-icon class="section-icon">
                        <Edit />
                    </el-icon>
                    <h3 class="section-title">智能修改</h3>
                </div>
                <div class="modification-content">
                    <el-input v-model="codeStore.modificationText" type="textarea" :rows="2"
                        placeholder="描述您想要的修改，例如：调整按钮颜色为蓝色、增加动画效果等..." maxlength="500" show-word-limit
                        class="modification-input" />
                    <el-button type="primary" :loading="codeStore.isModifying" @click="$emit('modify')"
                        :disabled="!codeStore.modificationText.trim()" class="modify-btn">
                        <el-icon v-if="!codeStore.isModifying">
                            <MagicStick />
                        </el-icon>
                        {{ codeStore.isModifying ? '修改中...' : '应用修改' }}
                    </el-button>
                </div>
            </div>

            <!-- 内容选项卡 -->
            <div class="tabs-container">
                <el-tabs v-model="codeStore.activeTab" class="content-tabs" type="card">
                    <!-- 生成代码 -->
                    <el-tab-pane name="code">
                        <template #label>
                            <div class="tab-label">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                                <span>生成代码</span>
                            </div>
                        </template>
                        <div class="tab-content">
                            <CodeEditor v-model="codeStore.generatedCode" language="html" :readonly="false" />
                        </div>
                    </el-tab-pane>

                    <!-- 实时预览 -->
                    <el-tab-pane name="preview">
                        <template #label>
                            <div class="tab-label">
                                <el-icon>
                                    <ChatDotRound />
                                </el-icon>
                                <span>实时预览</span>
                            </div>
                        </template>
                        <div class="tab-content">
                            <PreviewPanel :code="codeStore.generatedCode" />
                        </div>
                    </el-tab-pane>

                    <!-- 分屏模式 -->
                    <el-tab-pane name="split">
                        <template #label>
                            <div class="tab-label">
                                <el-icon>
                                    <Download />
                                </el-icon>
                                <span>分屏模式</span>
                            </div>
                        </template>
                        <div class="tab-content split-view">
                            <div class="split-panel split-left" :style="{ width: splitLeftWidth + '%' }">
                                <div class="panel-header">
                                    <h4>代码编辑</h4>
                                </div>
                                <CodeEditor v-model="codeStore.generatedCode" language="html" :readonly="false" />
                            </div>
                            <div class="split-divider" :class="{ 'dragging': isDragging }" @mousedown="handleMouseDown"
                                @dblclick="handleDoubleClick" title="拖拽调整左右面板宽度，双击重置为平分">
                                <div class="drag-indicator">
                                    <div class="drag-dot"></div>
                                    <div class="drag-dot"></div>
                                    <div class="drag-dot"></div>
                                </div>
                            </div>
                            <div class="split-panel split-right" :style="{ width: (100 - splitLeftWidth) + '%' }">
                                <div class="panel-header">
                                    <h4>实时预览</h4>
                                </div>
                                <PreviewPanel :code="codeStore.generatedCode" />
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
    MagicStick,
    Edit,
    Download,
    ChatDotRound
} from "@element-plus/icons-vue"
import { useCodeStore } from '@/stores/code'
import CodeEditor from './CodeEditor.vue'
import PreviewPanel from './PreviewPanel.vue'

const codeStore = useCodeStore()

// 分屏拖拽相关数据
const splitLeftWidth = ref(50) // 左侧面板宽度百分比
const isDragging = ref(false)
const startX = ref(0)
const startLeftWidth = ref(50)

// 拖拽相关方法
const handleMouseDown = (e: MouseEvent) => {
    isDragging.value = true
    startX.value = e.clientX
    startLeftWidth.value = splitLeftWidth.value

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
}

const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return

    e.preventDefault()

    const splitView = (e.target as HTMLElement).closest('.split-view') as HTMLElement
    if (!splitView) return

    const rect = splitView.getBoundingClientRect()
    const deltaX = e.clientX - startX.value
    const deltaPercent = (deltaX / rect.width) * 100

    let newLeftWidth = startLeftWidth.value + deltaPercent

    // 限制最小和最大宽度（更合理的范围）
    newLeftWidth = Math.max(15, Math.min(85, newLeftWidth))

    splitLeftWidth.value = newLeftWidth
}

const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
}

// 双击重置布局
const handleDoubleClick = () => {
    splitLeftWidth.value = 50
}

defineEmits<{
    'modify': []
    'load-demo': []
}>()
</script>

<style scoped>
.content-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* 空状态样式 */
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f2f5;
}

.empty-content {
    text-align: center;
    max-width: 500px;
    padding: 60px 40px;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
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
    margin: 0 0 32px 0;
}

.empty-features {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 32px;
}

.feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border: 1px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s ease;
}

.feature-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.feature-icon {
    font-size: 20px;
    color: #667eea;
}

.feature-item span {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

/* 演示按钮区域 */
.demo-actions {
    margin-top: 40px;
    text-align: center;
}

.demo-btn {
    background: linear-gradient(45deg, #10B981, #059669) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 15px 30px !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
}

.demo-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
}

/* 内容包装器 */
.content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
}

/* 修改建议区域 */
.modification-section {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f2f5;
}

.modification-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
}

.section-icon {
    font-size: 20px;
    color: #667eea;
}

.modification-section .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1a202c;
}

.modification-content {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.modification-input {
    flex: 1;
}

.modify-btn {
    background: linear-gradient(45deg, #667eea, #764ba2) !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
    min-width: 120px;
    height: auto !important;
    white-space: nowrap;
}

.modify-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3) !important;
}

/* 选项卡容器 */
.tabs-container {
    flex: 1;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f2f5;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.content-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.content-tabs :deep(.el-tabs__header) {
    margin: 0;
    padding: 20px 24px 0 24px;
    background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
    border-bottom: 1px solid #f0f2f5;
}

.content-tabs :deep(.el-tabs__nav-wrap::after) {
    display: none;
}

.content-tabs :deep(.el-tabs__nav) {
    border: none;
    background: white;
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-tabs :deep(.el-tabs__item) {
    border: none !important;
    padding: 12px 20px !important;
    margin: 0 4px !important;
    border-radius: 8px !important;
    color: #64748b !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    background: transparent !important;
    box-shadow: none !important;
}

.content-tabs :deep(.el-tabs__item::before),
.content-tabs :deep(.el-tabs__item::after) {
    display: none !important;
}

.content-tabs :deep(.el-tabs__item:hover) {
    color: #667eea !important;
    background: rgba(102, 126, 234, 0.1) !important;
    box-shadow: none !important;
}

.content-tabs :deep(.el-tabs__item.is-active) {
    color: white !important;
    background: linear-gradient(45deg, #667eea, #764ba2) !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.content-tabs :deep(.el-tabs__item.is-active::before) {
    display: none !important;
}

.content-tabs :deep(.el-tabs__item.is-active::after) {
    display: none !important;
}

.content-tabs :deep(.el-tabs__item.is-active *) {
    color: white !important;
}

.content-tabs :deep(.el-tabs__active-bar) {
    display: none !important;
}

.tab-label {
    display: flex;
    align-items: center;
    gap: 8px;
}

.content-tabs :deep(.el-tabs__item.is-active .tab-label) {
    color: white !important;
}

.content-tabs :deep(.el-tabs__item.is-active .tab-label span) {
    color: white !important;
}

.content-tabs :deep(.el-tabs__item.is-active .tab-label .el-icon) {
    color: white !important;
}

.content-tabs :deep(.el-tabs__content) {
    flex: 1;
    padding: 24px;
    overflow: hidden;
}

.tab-content {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: #fafbfc;
    border: 1px solid #f0f2f5;
}

/* 分屏模式样式 */
.split-view {
    display: flex;
    height: 100%;
    background: transparent !important;
    border: none !important;
    position: relative;
}

.split-panel {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #f0f2f5;
    overflow: hidden;
    min-width: 200px;
    /* 设置最小宽度 */
}

.split-divider {
    width: 8px;
    background: linear-gradient(180deg, #667eea, #764ba2);
    border-radius: 4px;
    position: relative;
    cursor: col-resize;
    transition: all 0.2s ease;
    margin: 0 4px;
    flex-shrink: 0;
    /* 防止分割线被压缩 */
    display: flex;
    align-items: center;
    justify-content: center;
}

.split-divider:hover {
    background: linear-gradient(180deg, #5a6fd8, #6b46a8);
    width: 10px;
    margin: 0 3px;
}

.split-divider.dragging {
    background: linear-gradient(180deg, #4c63d2, #5d3f9e);
    width: 10px;
    margin: 0 3px;
    box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.drag-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.split-divider:hover .drag-indicator {
    opacity: 1;
}

.drag-dot {
    width: 3px;
    height: 3px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.split-divider::before {
    display: none;
    /* 隐藏原来的圆圈 */
}

.panel-header {
    padding: 12px 16px;
    background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
    border-bottom: 1px solid #f0f2f5;
}

.panel-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.split-left,
.split-right {
    min-width: 0;
}

:deep(.el-tab-pane) {
    height: 100%;
}
</style>
