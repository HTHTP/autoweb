<template>
  <div class="preview-container">
    <div class="preview-header">
      <div class="preview-tabs">
        <el-radio-group v-model="previewMode" size="small">
          <el-radio-button label="overview">项目概览</el-radio-button>
          <el-radio-button label="homepage">主页预览</el-radio-button>
          <el-radio-button label="components">组件预览</el-radio-button>
        </el-radio-group>
      </div>
      <div class="preview-actions">
        <el-button
          size="small"
          type="primary"
          :icon="Refresh"
          @click="refreshPreview"
        >
          刷新
        </el-button>
      </div>
    </div>

    <div class="preview-content">
      <!-- 项目概览 -->
      <div v-if="previewMode === 'overview'" class="overview-panel">
        <div class="project-info">
          <h3>{{ projectInfo.name }}</h3>
          <p>{{ projectInfo.description }}</p>
          <div class="tech-stack">
            <el-tag
              v-for="tech in projectInfo.techStack"
              :key="tech"
              size="small"
              type="info"
            >
              {{ tech }}
            </el-tag>
          </div>
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="8">
            <div class="stat-card">
              <el-icon><Document /></el-icon>
              <div class="stat-number">{{ projectStats.pages }}</div>
              <div class="stat-label">页面</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <el-icon><Folder /></el-icon>
              <div class="stat-number">{{ projectStats.components }}</div>
              <div class="stat-label">组件</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <el-icon><Document /></el-icon>
              <div class="stat-number">{{ projectStats.totalFiles }}</div>
              <div class="stat-label">总文件</div>
            </div>
          </el-col>
        </el-row>

        <div class="project-structure">
          <h4>项目结构</h4>
          <div class="structure-list">
            <div
              v-for="item in projectStructure"
              :key="item.path"
              class="structure-item"
              :class="{ folder: item.isFolder }"
            >
              <el-icon v-if="item.isFolder"><Folder /></el-icon>
              <el-icon v-else><Document /></el-icon>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主页预览 -->
      <div v-else-if="previewMode === 'homepage'" class="homepage-panel">
        <iframe
          ref="previewFrame"
          :srcdoc="homepagePreviewCode"
          class="preview-iframe"
          @load="onPreviewLoad"
        />
      </div>

      <!-- 组件预览 -->
      <div v-else-if="previewMode === 'components'" class="components-panel">
        <div class="components-grid">
          <div
            v-for="component in projectComponents"
            :key="component.name"
            class="component-card"
            @click="selectComponent(component)"
          >
            <div class="component-header">
              <h4>{{ component.name }}</h4>
            </div>
            <div class="component-preview">
              <code>{{ component.preview }}</code>
            </div>
            <div class="component-path">
              {{ component.path }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, Folder, Document } from "@element-plus/icons-vue";

interface Props {
  code: string;
}

const props = defineProps<Props>();

const previewFrame = ref<HTMLIFrameElement>();
const previewMode = ref("overview");

// 解析项目数据
const projectData = computed(() => {
  if (!props.code) return {};

  try {
    return JSON.parse(props.code);
  } catch (error) {
    console.error("解析项目数据失败:", error);
    return {};
  }
});

// 项目信息
const projectInfo = computed(() => {
  const data = projectData.value;
  const projectName =
    Object.keys(data)
      .find((key) => key.endsWith("/") && !key.includes("/src/"))
      ?.replace("/", "") || "Vue3项目";

  return {
    name: projectName,
    description: "由AI网页生成器自动创建的Vue3项目",
    techStack: ["Vue 3", "TypeScript", "Element Plus", "Vite", "Vue Router"],
  };
});

// 项目统计
const projectStats = computed(() => {
  const data = projectData.value;
  const files = Object.keys(data).filter((key) => data[key] !== "folder");

  const pages = files.filter(
    (file) => file.includes("/views/") && file.endsWith(".vue")
  ).length;
  const components = files.filter(
    (file) => file.includes("/components/") && file.endsWith(".vue")
  ).length;

  return {
    pages: pages || 2,
    components: components || 2,
    totalFiles: files.length || 12,
  };
});

// 项目结构
const projectStructure = computed(() => {
  const structure: any[] = [];

  // 生成简化的项目结构显示
  const mainFolders = [
    "src/",
    "public/",
    "package.json",
    "vite.config.js",
    "index.html",
  ];

  mainFolders.forEach((folder) => {
    structure.push({
      name: folder,
      path: folder,
      isFolder: folder.endsWith("/"),
    });

    if (folder === "src/") {
      structure.push(
        { name: "  views/", path: "src/views/", isFolder: true },
        { name: "  components/", path: "src/components/", isFolder: true },
        { name: "  router/", path: "src/router/", isFolder: true },
        { name: "  App.vue", path: "src/App.vue", isFolder: false },
        { name: "  main.js", path: "src/main.js", isFolder: false }
      );
    }
  });

  return structure;
});

// 项目组件
const projectComponents = computed(() => {
  const data = projectData.value;
  const components: any[] = [];

  Object.keys(data).forEach((filePath) => {
    if (filePath.includes("/components/") && filePath.endsWith(".vue")) {
      const componentName =
        filePath.split("/").pop()?.replace(".vue", "") || "";
      components.push({
        name: componentName,
        path: filePath,
        preview: `<${componentName} />`,
      });
    }
  });

  // 如果没有找到组件，添加默认组件
  if (components.length === 0) {
    components.push(
      {
        name: "Header",
        path: "src/components/Header.vue",
        preview: "<Header />",
      },
      {
        name: "Footer",
        path: "src/components/Footer.vue",
        preview: "<Footer />",
      }
    );
  }

  return components;
});

// 主页预览代码
const homepagePreviewCode = computed(() => {
  const data = projectData.value;

  // 查找主页文件
  const homePagePath = Object.keys(data).find(
    (key) =>
      key.includes("/views/Home.vue") || key.includes("/views/HomePage.vue")
  );

  if (homePagePath && data[homePagePath]) {
    // 提取Vue组件并转换为可预览的HTML
    return convertVueToPreviewHtml(data[homePagePath]);
  }

  // 默认预览内容
  return generateDefaultPreview();
});

// 将Vue组件转换为预览HTML
function convertVueToPreviewHtml(vueCode: string): string {
  // 提取template部分
  const templateMatch = vueCode.match(/<template>([\s\S]*?)<\/template>/);
  let template = templateMatch ? templateMatch[1] : "<div>Vue组件预览</div>";

  // 提取style部分
  const styleMatch = vueCode.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const styles = styleMatch ? styleMatch[1] : "";

  // 简化Vue指令和组件
  template = template
    .replace(/v-for="[^"]*"/g, "")
    .replace(/v-if="[^"]*"/g, "")
    .replace(/v-model="[^"]*"/g, "")
    .replace(/@click="[^"]*"/g, "")
    .replace(/<el-([^>]*)>/g, '<div class="el-$1">')
    .replace(/<\/el-[^>]*>/g, "</div>")
    .replace(/{{ [^}]* }}/g, "示例内容");

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vue3项目预览</title>
      <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .el-button { 
          background: #409eff; 
          color: white; 
          padding: 8px 16px; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
        }
        .el-card { 
          border: 1px solid #ebeef5; 
          border-radius: 4px; 
          padding: 20px; 
          margin: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        ${styles}
      </style>
    </head>
    <body>
      ${template}
    </body>
    </html>
  `;
}

// 生成默认预览
function generateDefaultPreview(): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vue3项目预览</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #333; margin-bottom: 1rem; }
        p { color: #666; line-height: 1.6; }
        .feature { 
          background: #f8f9fa; 
          padding: 1rem; 
          margin: 1rem 0; 
          border-radius: 4px; 
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <h1>🎉 Vue3项目生成成功</h1>
        <p>这是由AI自动生成的Vue3项目预览</p>
        <div class="feature">
          <h3>✨ 现代化框架</h3>
          <p>使用Vue3 + TypeScript + Element Plus</p>
        </div>
        <div class="feature">
          <h3>🎨 响应式设计</h3>
          <p>完美适配桌面端和移动端</p>
        </div>
        <div class="feature">
          <h3>🚀 开箱即用</h3>
          <p>包含完整的项目配置和组件结构</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 选择组件
const selectComponent = (component: any) => {
  ElMessage.info(`选择了组件: ${component.name}`);
};

// 刷新预览
const refreshPreview = () => {
  if (previewFrame.value) {
    previewFrame.value.src = previewFrame.value.src;
  }
  ElMessage.success("预览已刷新");
};

const onPreviewLoad = () => {
  console.log("预览加载完成");
};
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.preview-content {
  flex: 1;
  overflow: auto;
}

/* 项目概览样式 */
.overview-panel {
  padding: 20px;
}

.project-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.project-info p {
  margin: 0 0 15px 0;
  color: #606266;
}

.tech-stack {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card .el-icon {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.project-structure {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-structure h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.structure-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.structure-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.structure-item:hover {
  background: #f5f7fa;
}

.structure-item .el-icon {
  color: #409eff;
}

.structure-item.folder .el-icon {
  color: #e6a23c;
}

/* 主页预览样式 */
.homepage-panel {
  height: 100%;
  padding: 0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

/* 组件预览样式 */
.components-panel {
  padding: 20px;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.component-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.component-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.component-header h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.component-preview {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.component-preview code {
  color: #e6a23c;
  font-family: "Monaco", "Menlo", monospace;
}

.component-path {
  color: #909399;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 10px;
  }

  .stats-row {
    display: block;
  }

  .stats-row .el-col {
    margin-bottom: 10px;
  }

  .components-grid {
    grid-template-columns: 1fr;
  }
}
</style>
