<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <h1 class="title">AI 网页生成器</h1>
        <div class="header-actions">
          <el-button
            type="primary"
            @click="exportCode2"
            :disabled="!generatedCode"
          >
            <el-icon><Download /></el-icon>
            导出代码
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-container class="main-container">
      <!-- 左侧输入面板 -->
      <el-aside width="400px" class="input-panel">
        <el-card class="input-card">
          <template #header>
            <span>描述您想要的网页</span>
          </template>

          <!-- 输入方式选择 -->
          <div class="input-type-selector">
            <el-radio-group v-model="inputType" size="small">
              <el-radio-button label="text">文字描述</el-radio-button>
              <el-radio-button label="sketch">草图上传</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 文字描述输入 -->
          <div v-if="inputType === 'text'" class="text-input">
            <el-input
              v-model="description"
              type="textarea"
              :rows="6"
              placeholder="请描述您想要的网页，例如：创建一个包含导航栏、轮播图和产品展示区的电商首页"
              maxlength="1000"
              show-word-limit
            />
          </div>

          <!-- 草图上传 -->
          <div v-if="inputType === 'sketch'" class="sketch-upload">
            <el-upload
              class="upload-demo"
              drag
              :auto-upload="false"
              :on-change="handleSketchUpload"
              accept="image/*"
            >
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                将草图文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">支持 jpg/png 格式的图片文件</div>
              </template>
            </el-upload>
          </div>

          <!-- 组件库选择 -->
          <div class="component-library">
            <el-divider content-position="left">组件库选择</el-divider>
            <el-checkbox-group v-model="selectedComponents">
              <el-checkbox label="导航栏">导航栏</el-checkbox>
              <el-checkbox label="轮播图">轮播图</el-checkbox>
              <el-checkbox label="卡片">卡片</el-checkbox>
              <el-checkbox label="表格">表格</el-checkbox>
              <el-checkbox label="表单">表单</el-checkbox>
              <el-checkbox label="按钮">按钮</el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 样式风格选择 -->
          <div class="style-selector">
            <el-divider content-position="left">样式风格</el-divider>
            <el-select v-model="selectedStyle" placeholder="选择样式风格">
              <el-option label="现代简约" value="modern" />
              <el-option label="商务专业" value="business" />
              <el-option label="活泼可爱" value="cute" />
              <el-option label="科技感" value="tech" />
            </el-select>
          </div>

          <!-- 生成按钮 -->
          <div class="generate-button">
            <el-button
              type="primary"
              size="large"
              :loading="isGenerating"
              @click="generateWebpage"
              :disabled="!canGenerate"
              block
            >
              <el-icon v-if="!isGenerating"><Star /></el-icon>
              {{ isGenerating ? "正在生成..." : "生成网页" }}
            </el-button>
          </div>

          <!-- 生成进度显示 -->
          <div v-if="showProgress" class="progress-section">
            <el-divider content-position="left">生成进度</el-divider>
            <div class="progress-info">
              <div class="progress-status">{{ generateStatus }}</div>
              <el-progress
                :percentage="generateProgress"
                :show-text="true"
                :stroke-width="8"
                status="success"
              />
            </div>
          </div>

          <!-- 修改建议输入 -->
          <div v-if="generatedCode" class="modification-input">
            <el-divider content-position="left">修改建议</el-divider>
            <el-input
              v-model="modificationText"
              type="textarea"
              :rows="3"
              placeholder="请描述您想要的修改，例如：把按钮颜色改为红色"
              maxlength="500"
              show-word-limit
            />
            <el-button
              type="success"
              size="small"
              :loading="isModifying"
              @click="modifyWebpage"
              :disabled="!modificationText.trim()"
              style="margin-top: 10px; width: 100%"
            >
              应用修改
            </el-button>
          </div>
        </el-card>
      </el-aside>

      <!-- 右侧代码和预览面板 -->
      <el-main class="content-area">
        <el-tabs v-model="activeTab" class="content-tabs">
          <!-- 代码编辑器 -->
          <el-tab-pane label="生成代码" name="code">
            <CodeEditor
              v-model="generatedCode"
              language="html"
              :readonly="false"
            />
          </el-tab-pane>

          <!-- 实时预览 -->
          <el-tab-pane label="实时预览" name="preview">
            <PreviewPanel :code="generatedCode" />
          </el-tab-pane>

          <!-- 分屏模式 -->
          <el-tab-pane label="分屏模式" name="split">
            <div class="split-view">
              <div class="split-left">
                <CodeEditor
                  v-model="generatedCode"
                  language="html"
                  :readonly="false"
                />
              </div>
              <div class="split-right">
                <PreviewPanel :code="generatedCode" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Download, Upload, Star } from "@element-plus/icons-vue";
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
const inputType = ref<"text" | "sketch">("text");
const description = ref("");
const selectedComponents = ref<string[]>([]);
const selectedStyle = ref("modern");
const generatedCode = ref("");
const isGenerating = ref(false);
const isModifying = ref(false);
const activeTab = ref("code");
const modificationText = ref("");

// 进度相关数据
const generateProgress = ref(0);
const generateStatus = ref("");
const showProgress = ref(false);

// 计算属性
const canGenerate = computed(() => {
  if (inputType.value === "text") {
    return description.value.trim().length > 0;
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
      description: description.value,
      components: selectedComponents.value,
      style: selectedStyle.value,
    });

    // 使用带进度的生成函数
    const code = await generateCodeWithProgress(
      {
        description: description.value,
        components: selectedComponents.value,
        style: selectedStyle.value,
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
</script>

<style scoped>
.home-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.main-container {
  flex: 1;
  height: calc(100vh - 60px);
}

.input-panel {
  background-color: #f8f9fa;
  padding: 0; /* 让 el-card 自己控制内边距 */
  border-right: 1px solid #e9ecef;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.input-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: auto;
  box-sizing: border-box;
  padding: 20px;
  overflow-y: auto;
}

.input-type-selector {
  margin-bottom: 20px;
}

.text-input,
.sketch-upload {
  margin-bottom: 20px;
}

.component-library,
.style-selector {
  margin-bottom: 20px;
}

.generate-button {
  margin-bottom: 20px;
}

.progress-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-info {
  text-align: center;
}

.progress-status {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.modification-input {
  margin-top: 20px;
}

.content-area {
  padding: 20px;
  background-color: #fff;
}

.content-tabs {
  height: 100%;
}

.split-view {
  display: flex;
  height: 500px;
  gap: 20px;
}

.split-left,
.split-right {
  flex: 1;
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
