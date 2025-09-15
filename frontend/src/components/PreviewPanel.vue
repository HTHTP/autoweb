<template>
  <div class="preview-container">
    <div class="preview-header">
      <span class="preview-title">HTML 预览</span>
      <div class="preview-actions">
        <el-button size="small" @click="refreshPreview" :disabled="!props.code">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
        <el-button size="small" @click="openInNewTab" :disabled="!props.code">
          <el-icon>
            <Link />
          </el-icon>
          新窗口打开
        </el-button>
        <el-button size="small" @click="downloadHtml" :disabled="!props.code">
          <el-icon>
            <Download />
          </el-icon>
          下载HTML
        </el-button>
      </div>
    </div>
    <div class="preview-content">
      <!-- 空状态显示 -->
      <div v-if="!props.code" class="preview-empty">
        <div class="empty-icon">📄</div>
        <h3 class="empty-title">等待HTML文件生成</h3>
        <p class="empty-description">
          请在左侧输入需求并生成HTML代码，<br />
          或导入HTML文件，<br />
          生成的网页将在此处实时预览
        </p>
      </div>
      <!-- HTML预览框架 -->
      <iframe v-else ref="previewFrame" :srcdoc="processedCode" class="preview-iframe"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups" @load="onPreviewLoad"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, Link, Download } from "@element-plus/icons-vue";
import { useCodeStore } from "@/stores/code";

interface Props {
  code: string;
}

const props = defineProps<Props>();
const codeStore = useCodeStore();

const previewFrame = ref<HTMLIFrameElement>();

// 处理代码，使用状态管理中的提取逻辑
const processedCode = computed(() => {
  console.log('===== PreviewPanel HTML处理 =====');
  console.log('接收到的props.code:', props.code ? `类型: ${typeof props.code}, 长度: ${props.code.length}` : 'null/undefined');

  if (!props.code) {
    console.log('没有代码，显示空状态');
    return "";
  }

  // 使用状态管理中的提取逻辑
  const extractedHtml = codeStore.extractedHtmlCode;
  console.log('提取的HTML长度:', extractedHtml.length);

  return extractedHtml;
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

const downloadHtml = () => {
  if (!processedCode.value) return;

  const blob = new Blob([processedCode.value], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `generated-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  ElMessage.success("HTML文件已下载");
};

const onPreviewLoad = () => {
  console.log("HTML预览加载完成");
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

/* 空状态样式 */
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}
</style>
