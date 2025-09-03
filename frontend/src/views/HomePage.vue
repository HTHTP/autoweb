<template>
    <div class="home-page">
        <!-- 顶部导航栏 -->
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
                    <el-button type="primary" @click="exportCode2" :disabled="!generatedCode" class="export-btn">
                        <el-icon>
                            <Download />
                        </el-icon>
                        导出代码
                    </el-button>
                </div>
            </div>
        </el-header>

        <!-- 主要内容区域 -->
        <el-container class="main-container">
            <!-- 左侧输入面板 -->
            <el-aside width="440px" class="input-panel">
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
                                    :class="{ active: selectedLibrary === lib.name }" :style="{
                                        borderColor: selectedLibrary === lib.name ? lib.color : '#e5e7eb',
                                        backgroundColor: selectedLibrary === lib.name ? lib.bgColor : 'white'
                                    }" @click="selectedLibrary = lib.name">
                                    <div class="library-header">
                                        <div class="library-icon">
                                            <img v-if="lib.icon.startsWith('http') || lib.icon.startsWith('/')"
                                                :src="lib.icon" :alt="lib.name" class="library-icon-img" />
                                            <span v-else>{{ lib.icon }}</span>
                                        </div>
                                        <el-icon v-if="selectedLibrary === lib.name" class="check-icon"
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
                                <div class="method-button" :class="{ active: inputMethod === 'text' }"
                                    @click="inputMethod = 'text'">
                                    <el-icon class="method-icon">
                                        <ChatDotRound />
                                    </el-icon>
                                    <span>自然语言</span>
                                </div>
                                <div class="method-button" :class="{ active: inputMethod === 'sketch' }"
                                    @click="inputMethod = 'sketch'">
                                    <el-icon class="method-icon">
                                        <Edit />
                                    </el-icon>
                                    <span>草图上传</span>
                                </div>
                            </div>
                        </div>

                        <!-- 文字描述输入 -->
                        <div v-if="inputMethod === 'text'" class="section">
                            <el-input v-model="userPrompt" type="textarea" :rows="8"
                                placeholder="描述您想要的网页，例如：'创建一个带有导航栏、英雄区域和联系表单的个人作品集网站，使用蓝色主题'" class="description-input"
                                resize="none" />
                        </div>

                        <!-- 草图上传 -->
                        <div v-if="inputMethod === 'sketch'" class="section">
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
                            <el-button type="primary" size="large" :loading="isGenerating" @click="generateWebpage"
                                :disabled="!canGenerate" class="generate-btn">
                                <el-icon v-if="!isGenerating">
                                    <MagicStick />
                                </el-icon>
                                {{ isGenerating ? "生成中..." : "生成代码" }}
                            </el-button>
                        </div>

                        <!-- 生成进度显示 -->
                        <div v-if="showProgress" class="progress-section">
                            <div class="progress-info">
                                <div class="progress-status">{{ generateStatus }}</div>
                                <el-progress :percentage="generateProgress" :show-text="true" :stroke-width="8"
                                    :color="generateProgress === 100 ? '#67c23a' : '#409eff'" />
                            </div>
                        </div>
                    </div>
                </div>
            </el-aside>

            <!-- 右侧代码和预览面板 -->
            <el-main class="content-area">
                <div class="content-container">
                    <!-- 空状态 -->
                    <div v-if="!generatedCode" class="empty-state">
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
                            <div class="demo-actions">
                                <el-button type="primary" @click="loadDemoCode" class="demo-btn" size="large">
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
                                <el-input v-model="modificationText" type="textarea" :rows="2"
                                    placeholder="描述您想要的修改，例如：调整按钮颜色为蓝色、增加动画效果等..." maxlength="500" show-word-limit
                                    class="modification-input" />
                                <el-button type="primary" :loading="isModifying" @click="modifyWebpage"
                                    :disabled="!modificationText.trim()" class="modify-btn">
                                    <el-icon v-if="!isModifying">
                                        <MagicStick />
                                    </el-icon>
                                    {{ isModifying ? '修改中...' : '应用修改' }}
                                </el-button>
                            </div>
                        </div>

                        <!-- 内容选项卡 -->
                        <div class="tabs-container">
                            <el-tabs v-model="activeTab" class="content-tabs" type="card">
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
                                        <CodeEditor v-model="generatedCode" language="html" :readonly="false" />
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
                                        <PreviewPanel :code="generatedCode" />
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
                                        <div class="split-panel split-left">
                                            <div class="panel-header">
                                                <h4>代码编辑</h4>
                                            </div>
                                            <CodeEditor v-model="generatedCode" language="html" :readonly="false" />
                                        </div>
                                        <div class="split-divider"></div>
                                        <div class="split-panel split-right">
                                            <div class="panel-header">
                                                <h4>实时预览</h4>
                                            </div>
                                            <PreviewPanel :code="generatedCode" />
                                        </div>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                    </div>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Download, Upload, Edit, Check, ChatDotRound, MagicStick, QuestionFilled } from "@element-plus/icons-vue";
// @ts-ignore
import CodeEditor from "../components/CodeEditor.vue";
// @ts-ignore
import PreviewPanel from "../components/PreviewPanel.vue";
import {
    generateCodeWithProgress,
    modifyCode,
    exportCode,
} from "../api/generate";

// 响应式数据
const generatedCode = ref("");
const isGenerating = ref(false);
const isModifying = ref(false);
const activeTab = ref("code");
const modificationText = ref("");

// 新增的数据属性
const inputMethod = ref<'text' | 'sketch'>('text');
const selectedLibrary = ref('Element Plus');
const userPrompt = ref('');

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
]);

// 进度相关数据
const generateProgress = ref(0);
const generateStatus = ref("");
const showProgress = ref(false);

// 计算属性
const canGenerate = computed(() => {
    if (inputMethod.value === "text") {
        return userPrompt.value.trim().length > 0;
    }
    return false; // 草图功能暂未实现
});

// 生成网页
const generateWebpage = async () => {
    if (!canGenerate.value) return;

    isGenerating.value = true;
    showProgress.value = true;
    generateProgress.value = 0;
    generateStatus.value = "开始生成网页";

    try {
        console.log("开始生成网页...", {
            description: userPrompt.value,
            library: selectedLibrary.value,
        });

        // 使用带进度的生成函数
        const code = await generateCodeWithProgress(
            {
                description: userPrompt.value,
                components: [selectedLibrary.value],
                style: "modern",
            },
            (status: string, progress: number) => {
                // 进度回调
                generateStatus.value = status;
                generateProgress.value = progress;
                console.log(`生成进度: ${status} (${progress}%)`);
            }
        );

        generatedCode.value = code;
        activeTab.value = "code";
        ElMessage.success("网页生成成功！");
    } catch (error: any) {
        console.error("生成失败:", error);

        // 根据不同的错误类型给出不同的提示
        if (error.code === "ECONNABORTED") {
            ElMessage.error("请求超时，AI 生成需要较长时间，请稍后重试");
        } else if (error.message?.includes("Network Error")) {
            ElMessage.error("网络连接失败，请检查后端服务是否正常运行");
        } else {
            ElMessage.error(`生成失败: ${error.message || "未知错误"}`);
        }
    } finally {
        isGenerating.value = false;
        showProgress.value = false;
    }
};

// 修改网页
const modifyWebpage = async () => {
    if (!modificationText.value.trim() || !generatedCode.value) return;

    isModifying.value = true;
    try {
        const response = await modifyCode({
            currentCode: generatedCode.value,
            modification: modificationText.value,
        });

        if (response.success) {
            generatedCode.value = response.code;
            modificationText.value = "";
            ElMessage.success("修改应用成功！");
        } else {
            ElMessage.error(response.message || "修改失败");
        }
    } catch (error) {
        console.error("修改失败:", error);
        ElMessage.error("修改失败，请检查网络连接");
    } finally {
        isModifying.value = false;
    }
};

// 导出代码
const exportCode2 = async () => {
    if (!generatedCode.value) return;

    try {
        const blob = await exportCode(generatedCode.value);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // 根据生成的代码类型确定文件名
        let filename = "generated-webpage.zip";
        try {
            // 尝试解析为Vue3项目结构
            const projectStructure = JSON.parse(generatedCode.value);
            if (typeof projectStructure === "object" && projectStructure !== null) {
                filename = "vue3-project.zip";
            }
        } catch (e) {
            // 如果解析失败，说明是HTML文件
            filename = "generated-webpage.zip";
        }

        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        ElMessage.success("项目导出成功！");
    } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败");
    }
};

// 处理草图上传
const handleSketchUpload = (file: any) => {
    console.log("上传的草图:", file);
    ElMessage.info("草图功能开发中，敬请期待！");
};

// 加载演示代码
const loadDemoCode = () => {
    const demoProject = {
        "package.json": JSON.stringify({
            "name": "ai-vue-demo",
            "version": "1.0.0",
            "dependencies": {
                "vue": "^3.5.17",
                "element-plus": "^2.10.4"
            }
        }, null, 2),
        "index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Vue3 Demo</title>\n</head>\n<body>\n  <div id=\"app\"></div>\n</body>\n</html>",
        "src/main.js": "import { createApp } from 'vue'\nimport App from './App.vue'\n\ncreateApp(App).mount('#app')",
        "src/App.vue": "<template>\n  <div>\n    <h1>Vue3 Demo App</h1>\n    <p>This is a demo Vue3 project</p>\n  </div>\n</template>"
    };

    generatedCode.value = JSON.stringify(demoProject, null, 2);
    activeTab.value = "code";
    ElMessage.success("Vue3演示项目已加载！");
};
</script>

<style scoped>
.home-page {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
}

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



.library-icon {
    font-size: 24px;
    margin-bottom: 8px;
    display: block;
}

.library-name {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin: 0;
}

.check-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    color: #4f46e5;
    font-size: 16px;
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

.description-input .el-textarea__inner {
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
    resize: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.description-input .el-textarea__inner:focus {
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

.description-input :deep(.el-textarea__inner) {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    padding: 16px;
    font-size: 14px;
    line-height: 1.5;
    transition: border-color 0.2s ease;
}

.description-input :deep(.el-textarea__inner):focus {
    border-color: #4f46e5;
}

.sketch-uploader {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 32px 16px;
    text-align: center;
    transition: border-color 0.2s ease;
}

.sketch-uploader {
    width: 100%;
}

.sketch-uploader .el-upload-dragger {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background: #fafbfc;
    transition: all 0.3s ease;
    padding: 40px 20px;
}

.sketch-uploader .el-upload-dragger:hover {
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
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.2s ease;
}

.generate-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

.modification-input {
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.content-area {
    padding: 24px;
    background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
    position: relative;
    height: calc(100vh - 80px);
    overflow: hidden;
}

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

.content-tabs .el-tabs__header {
    margin: 0;
    padding: 20px 24px 0 24px;
    background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
    border-bottom: 1px solid #f0f2f5;
}

.content-tabs .el-tabs__nav-wrap::after {
    display: none;
}

.content-tabs .el-tabs__nav {
    border: none;
    background: white;
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-tabs .el-tabs__item {
    border: none !important;
    padding: 12px 20px;
    margin: 0 4px;
    border-radius: 8px;
    color: #64748b;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
}

.content-tabs .el-tabs__item:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
}

.content-tabs .el-tabs__item.is-active {
    color: white !important;
    background: linear-gradient(45deg, #667eea, #764ba2) !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.content-tabs .el-tabs__active-bar {
    display: none;
}

.tab-label {
    display: flex;
    align-items: center;
    gap: 8px;
}

.content-tabs .el-tabs__content {
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
    gap: 16px;
    background: transparent !important;
    border: none !important;
}

.split-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #f0f2f5;
    overflow: hidden;
}

.split-divider {
    width: 2px;
    background: linear-gradient(180deg, #667eea, #764ba2);
    border-radius: 1px;
    position: relative;
}

.split-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: white;
    border: 2px solid #667eea;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
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
    /* 防止内容溢出 */
}

.content-tabs .el-tabs__active-bar {
    display: none;
}

:deep(.el-tabs__content) {
    height: calc(100% - 40px);
}

:deep(.el-tab-pane) {
    height: 100%;
}

:deep(.el-card__body) {
    height: calc(100% - 60px);
    overflow-y: auto;
}
</style>
