<template>
  <div class="preview-container">
    <div class="preview-header">
      <span class="preview-title">实时预览</span>
      <div class="preview-actions">
        <el-button size="small" @click="refreshPreview">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button size="small" @click="openInNewTab">
          <el-icon><Link /></el-icon>
          新窗口打开
        </el-button>
      </div>
    </div>
    <div class="preview-content">
      <iframe
        ref="previewFrame"
        :srcdoc="processedCode"
        class="preview-iframe"
        sandbox="allow-scripts allow-same-origin"
        @load="onPreviewLoad"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, Link } from "@element-plus/icons-vue";

interface Props {
  code: string;
}

const props = defineProps<Props>();

const previewFrame = ref<HTMLIFrameElement>();

// 处理代码，添加必要的样式和脚本
const processedCode = computed(() => {
  if (!props.code) return "";

  // 如果是完整的 HTML 文档，直接返回
  if (props.code.includes("<!DOCTYPE html>")) {
    return props.code;
  }

  // 否则包装成完整的 HTML 文档
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>预览</title>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #app {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="app">
    ${props.code}
  </div>
</body>
</html>`;
});

const refreshPreview = () => {
  if (previewFrame.value) {
    previewFrame.value.src = previewFrame.value.src;
    ElMessage.success("预览已刷新");
  }
};

const openInNewTab = () => {
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.write(processedCode.value);
    newWindow.document.close();
  }
};

const onPreviewLoad = () => {
  console.log("预览加载完成");
};
</script>

<style scoped>
.preview-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  height: calc(100% - 49px);
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #fff;
}
</style>
