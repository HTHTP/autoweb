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
            <!-- 选择组件库 -->
            <div class="section">
                <h3 class="section-title">选择组件库</h3>
                <div class="library-grid">
                    <div v-for="lib in componentLibraries" :key="lib.name" class="library-card"
                        :class="{ active: codeStore.selectedLibrary === lib.name }" :style="{
                            borderColor: codeStore.selectedLibrary === lib.name ? lib.color : '#e5e7eb',
                            backgroundColor: codeStore.selectedLibrary === lib.name ? lib.bgColor : 'white'
                        }" @click="codeStore.selectedLibrary = lib.name">
                        <div class="library-header">
                            <div class="library-icon">
                                <img v-if="lib.icon.startsWith('http') || lib.icon.startsWith('/')" :src="lib.icon"
                                    :alt="lib.name" class="library-icon-img" />
                                <span v-else>{{ lib.icon }}</span>
                            </div>
                            <el-icon v-if="codeStore.selectedLibrary === lib.name" class="check-icon"
                                :style="{ color: lib.color }">
                                <Check />
                            </el-icon>
                        </div>
                        <div class="library-name">{{ lib.name }}</div>
                        <div class="library-description">{{ lib.description }}</div>
                    </div>
                </div>
            </div>

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

            <!-- 生成按钮 -->
            <div class="section">
                <el-button type="primary" size="large" :loading="codeStore.isGenerating" @click="$emit('generate')"
                    :disabled="!codeStore.canGenerate" class="generate-btn">
                    <el-icon v-if="!codeStore.isGenerating">
                        <MagicStick />
                    </el-icon>
                    {{ codeStore.isGenerating ? "生成中..." : "生成代码" }}
                </el-button>

                <!-- 加载演示代码按钮 -->
                <el-button type="success" size="large" @click="$emit('load-demo')" class="demo-btn"
                    style="margin-top: 12px; width: 100%;">
                    <el-icon>
                        <MagicStick />
                    </el-icon>
                    加载演示代码
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
    MagicStick,
    ChatDotRound,
    Edit,
    Check,
    Upload
} from "@element-plus/icons-vue"
import { useCodeStore } from '@/stores/code'

const codeStore = useCodeStore()

defineEmits<{
    'generate': []
    'load-demo': []
}>()

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

// 处理草图上传
const handleSketchUpload = (file: any) => {
    console.log("上传的草图:", file)
    ElMessage.info("草图功能开发中，敬请期待！")
}
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

.library-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.library-card {
    padding: 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    position: relative;
    overflow: hidden;
}

.library-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: transparent;
    transition: all 0.3s ease;
}

.library-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.library-card.active::before {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.library-card.active {
    border-color: #667eea;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
}

.library-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.library-icon {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.library-icon-img {
    width: 36px;
    height: auto;
    object-fit: contain;
    max-height: 48px;
}

.check-icon {
    color: #67c23a;
    font-size: 18px;
}

.library-name {
    font-weight: 600;
    color: #1a202c;
    font-size: 14px;
    margin-bottom: 4px;
}

.library-description {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.4;
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
</style>
