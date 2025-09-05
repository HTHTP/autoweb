<template>
    <el-header class="header">
        <div class="header-content">
            <div class="brand-section">
                <div class="brand-icon">
                    <el-icon>
                        <Edit />
                    </el-icon>
                </div>
                <div class="brand-info">
                    <h1 class="title">AI 网页生成器</h1>
                    <p class="subtitle">用自然语言自动创建简易网页</p>
                </div>
            </div>
            <div class="header-actions">
                <el-button type="text" class="header-btn">
                    <el-icon>
                        <QuestionFilled />
                    </el-icon>
                    帮助
                </el-button>
                <el-button type="primary" @click="$emit('export-code')" :disabled="!hasGeneratedCode"
                    class="export-btn">
                    <el-icon>
                        <Download />
                    </el-icon>
                    导出代码
                </el-button>
            </div>
        </div>
    </el-header>
</template>

<script setup lang="ts">
import { Edit, QuestionFilled, Download } from "@element-plus/icons-vue"

defineProps<{
    hasGeneratedCode: boolean
}>()

defineEmits<{
    'export-code': []
}>()
</script>

<style scoped>
.header {
    height: 80px !important;
    background: linear-gradient(90deg, #56d5f1 0%, #1972c6 100%);
    box-shadow: 0 2px 20px rgba(102, 126, 234, 0.1);
    border-bottom: none;
    display: flex;
    align-items: center;
    color: white;
    padding: 0 20px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 24px;
}

.brand-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.brand-icon {
    font-size: 32px;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}

.brand-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    background: linear-gradient(45deg, hwb(212 22% 13%), #811dc0);
    font-weight: 400;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-btn {
    color: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    transition: all 0.3s ease !important;
}

.header-btn:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    transform: translateY(-1px);
}

.export-btn {
    background: linear-gradient(45deg, #4CAF50, #8BC34A) !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
}

.export-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
}

.export-btn:disabled {
    background: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    box-shadow: none !important;
}
</style>
