<template>
    <div class="home-page">
        <!-- 头部导航 -->
        <HeaderComponent :hasGeneratedCode="codeStore.generatedCode.trim() !== ''" @export-code="handleExportCode" />

        <!-- 主要内容区域 -->
        <el-row class="main-container" :gutter="0">
            <!-- 左侧输入面板 -->
            <el-col :span="6" class="input-panel">
                <InputPanel @generate="handleGenerate" />
            </el-col>

            <!-- 右侧内容区域 -->
            <el-col :span="18" class="content-area">
                <ContentPanel @modify="handleModify" @load-demo="handleLoadDemo" />
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import HeaderComponent from '../components/HeaderComponent.vue'
import InputPanel from '../components/InputPanel.vue'
import ContentPanel from '../components/ContentPanel.vue'
import { useCodeStore } from '../stores/code'
import { ElMessage } from 'element-plus'
import { generateCodeWithProgress, modifyCode } from '../api/generate'

const codeStore = useCodeStore()

// 生成代码
const handleGenerate = async () => {
    if (codeStore.inputMethod === 'text' && !codeStore.userPrompt.trim()) {
        ElMessage.warning('请输入功能描述')
        return
    }

    codeStore.setGenerating(true)
    codeStore.setShowProgress(true)
    codeStore.setProgress('正在生成代码...', 0)

    try {
        const code = await generateCodeWithProgress(
            {
                description: codeStore.userPrompt,
                components: ['Element Plus'],
                style: 'modern'
            },
            (status: string, progress: number) => {
                codeStore.setProgress(status, progress)
            }
        )

        codeStore.setGeneratedCode(code)
        codeStore.setProgress('代码生成完成', 100)
        codeStore.activeTab = 'code'
        ElMessage.success('代码生成成功！')
    } catch (error) {
        console.error('生成失败:', error)
        ElMessage.error('代码生成失败，请重试')
        codeStore.setProgress('生成失败', 0)
    } finally {
        codeStore.setGenerating(false)
        codeStore.setShowProgress(false)
    }
}

// 修改代码
const handleModify = async () => {
    if (!codeStore.modificationText.trim()) {
        ElMessage.warning('请输入修改建议')
        return
    }

    if (!codeStore.generatedCode.trim()) {
        ElMessage.warning('请先生成代码')
        return
    }

    codeStore.setModifying(true)

    try {
        const result = await modifyCode({
            currentCode: codeStore.generatedCode,
            modification: codeStore.modificationText
        })

        if (result.success && result.code) {
            codeStore.setGeneratedCode(result.code)
            codeStore.modificationText = ''
            ElMessage.success('代码修改成功！')
        } else {
            ElMessage.error(result.message || '代码修改失败')
        }
    } catch (error) {
        console.error('修改失败:', error)
        ElMessage.error('代码修改失败，请重试')
    } finally {
        codeStore.setModifying(false)
    }
}

// 加载演示
const handleLoadDemo = () => {
    codeStore.loadDemoCode()
    ElMessage.success('演示代码已加载')
}

// 导出代码
const handleExportCode = () => {
    if (!codeStore.generatedCode.trim()) {
        ElMessage.warning('没有可导出的代码')
        return
    }

    // 创建并下载文件
    const blob = new Blob([codeStore.generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'generated-code.vue'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('代码已导出')
}
</script>

<style scoped>
.home-page {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
}

.main-container {
    flex: 1;
    height: calc(100vh - 80px);
    background: #f5f7fa;
}

.input-panel {
    background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
    padding: 0;
    border-right: 1px solid #e1e8ed;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.content-area {
    padding: 24px;
    background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
    position: relative;
    height: calc(100vh - 80px);
    overflow: hidden;
}
</style>
