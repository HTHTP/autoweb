<template>
  <div class="vue-project-viewer">
    <!-- 项目结构视图选择 -->
    <div class="view-tabs">
      <el-tabs v-model="activeView" class="project-tabs">
        <el-tab-pane label="文件树" name="tree">
          <div class="file-tree-view">
            <div class="tree-header">
              <span>项目结构</span>
              <div class="header-actions">
                <el-button size="small" @click="expandAll">展开全部</el-button>
                <el-button size="small" @click="collapseAll"
                  >折叠全部</el-button
                >
              </div>
            </div>
            <el-tree
              ref="treeRef"
              :data="fileTreeData"
              :props="treeProps"
              node-key="path"
              @node-click="selectFile"
              :expand-on-click-node="false"
              :default-expand-all="false"
              class="file-tree"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-icon v-if="data.isFolder" class="folder-icon">
                    <Folder />
                  </el-icon>
                  <el-icon v-else class="file-icon">
                    <Document />
                  </el-icon>
                  <span class="node-label">{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>

        <el-tab-pane label="文件内容" name="content">
          <div class="file-content-view">
            <div class="content-header">
              <span>{{ selectedFile || "请选择文件" }}</span>
              <div class="header-actions">
                <el-button size="small" @click="copyFileContent"
                  >复制内容</el-button
                >
              </div>
            </div>
            <div class="content-editor">
              <textarea
                ref="contentTextarea"
                v-model="selectedFileContent"
                class="code-editor"
                :placeholder="
                  selectedFile ? '文件内容...' : '请从左侧文件树选择文件'
                "
                @input="handleContentChange"
                spellcheck="false"
              ></textarea>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="JSON源码" name="json">
          <div class="json-view">
            <div class="code-header">
              <span>项目JSON结构</span>
              <div class="header-actions">
                <el-button size="small" @click="copyCode">复制JSON</el-button>
                <el-button size="small" @click="formatJson">格式化</el-button>
              </div>
            </div>
            <div class="code-editor-wrapper">
              <textarea
                ref="jsonTextarea"
                v-model="localValue"
                class="code-editor json-editor"
                placeholder="Vue3项目JSON结构将在这里显示..."
                @input="handleInput"
                spellcheck="false"
              ></textarea>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElTree } from "element-plus";
import { Folder, Document } from "@element-plus/icons-vue";

interface Props {
  modelValue: string;
  language?: string;
  readonly?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  language: "json",
  readonly: false,
});

const emit = defineEmits<Emits>();

// 响应式数据
const activeView = ref("tree");
const localValue = ref(props.modelValue || "");
const selectedFile = ref("");
const selectedFileContent = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();
const contentTextarea = ref<HTMLTextAreaElement>();
const jsonTextarea = ref<HTMLTextAreaElement>();

// 文件树配置
const treeProps = {
  children: "children",
  label: "label",
  isLeaf: "isLeaf",
};

// 解析项目结构为文件树数据
const fileTreeData = computed(() => {
  if (!localValue.value) return [];

  try {
    const projectData = JSON.parse(localValue.value);
    return parseProjectToTree(projectData);
  } catch (error) {
    console.error("解析项目数据失败:", error);
    return [];
  }
});

// 解析项目数据为树形结构
function parseProjectToTree(projectData: any) {
  const tree: any[] = [];

  Object.keys(projectData).forEach((filePath) => {
    if (projectData[filePath] === "folder") return;

    const parts = filePath.split("/");
    let currentLevel = tree;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath += (index === 0 ? "" : "/") + part;

      if (index === parts.length - 1) {
        // 文件节点
        currentLevel.push({
          label: part,
          path: filePath,
          isFolder: false,
          isLeaf: true,
          content: projectData[filePath],
        });
      } else {
        // 文件夹节点
        let folder = currentLevel.find(
          (item) => item.label === part && item.isFolder
        );
        if (!folder) {
          folder = {
            label: part,
            path: currentPath,
            isFolder: true,
            isLeaf: false,
            children: [],
          };
          currentLevel.push(folder);
        }
        currentLevel = folder.children;
      }
    });
  });

  return tree;
}

// 监听 props 变化
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue || "";
  },
  { immediate: true }
);

// 处理JSON输入变化
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  localValue.value = target.value;
  emit("update:modelValue", target.value);
};

// 处理文件内容变化
const handleContentChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  selectedFileContent.value = target.value;
  updateFileInProject();
};

// 更新项目中的文件内容
const updateFileInProject = () => {
  if (!selectedFile.value || !localValue.value) return;

  try {
    const projectData = JSON.parse(localValue.value);
    projectData[selectedFile.value] = selectedFileContent.value;
    localValue.value = JSON.stringify(projectData, null, 2);
    emit("update:modelValue", localValue.value);
  } catch (error) {
    console.error("更新文件内容失败:", error);
  }
};

// 选择文件
const selectFile = (data: any) => {
  if (data.isFolder) return;

  selectedFile.value = data.path;
  selectedFileContent.value = data.content || "";
  activeView.value = "content";
};

// 展开全部
const expandAll = () => {
  const tree = treeRef.value;
  if (tree) {
    // 获取所有节点并展开
    const allNodes = getAllTreeNodes(fileTreeData.value);
    allNodes.forEach((node) => {
      if (!node.isLeaf) {
        tree.setCurrentKey(node.path);
      }
    });
  }
};

// 折叠全部
const collapseAll = () => {
  const tree = treeRef.value;
  if (tree) {
    // Element Plus的tree组件折叠所有节点
    tree.setCurrentKey(undefined);
  }
};

// 获取所有树节点
function getAllTreeNodes(nodes: any[]): any[] {
  let allNodes: any[] = [];
  nodes.forEach((node) => {
    allNodes.push(node);
    if (node.children) {
      allNodes = allNodes.concat(getAllTreeNodes(node.children));
    }
  });
  return allNodes;
}

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(localValue.value);
    ElMessage.success("JSON代码已复制到剪贴板");
  } catch (error) {
    console.error("复制失败:", error);
    ElMessage.error("复制失败");
  }
};

// 复制文件内容
const copyFileContent = async () => {
  try {
    await navigator.clipboard.writeText(selectedFileContent.value);
    ElMessage.success("文件内容已复制到剪贴板");
  } catch (error) {
    console.error("复制失败:", error);
    ElMessage.error("复制失败");
  }
};

// 格式化JSON
const formatJson = () => {
  try {
    const parsed = JSON.parse(localValue.value);
    localValue.value = JSON.stringify(parsed, null, 2);
    emit("update:modelValue", localValue.value);
    ElMessage.success("JSON格式化成功");
  } catch (error) {
    ElMessage.error("JSON格式错误，无法格式化");
  }
};
</script>

<style scoped>
.vue-project-viewer {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.view-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-tabs {
  height: 100%;
}

:deep(.el-tabs__content) {
  height: calc(100% - 40px);
  padding: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 文件树视图样式 */
.file-tree-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.file-tree {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
}

.folder-icon {
  color: #ffc107;
}

.file-icon {
  color: #6c757d;
}

.node-label {
  font-size: 14px;
}

/* 文件内容视图样式 */
.file-content-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  flex-shrink: 0;
  color: #d4d4d4;
}

.content-editor {
  flex: 1;
  overflow: hidden;
}

/* JSON视图样式 */
.json-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  flex-shrink: 0;
  color: #d4d4d4;
}

.code-editor-wrapper {
  flex: 1;
  overflow: hidden;
}

.code-editor {
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: none;
  outline: none;
  resize: none;
  padding: 12px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  direction: ltr;
  white-space: pre;
  word-wrap: normal;
  overflow-wrap: normal;
  tab-size: 2;
  box-sizing: border-box;
}

.json-editor {
  background-color: #1e1e1e;
  color: #569cd6; /* JSON高亮颜色 */
}

.code-editor:focus {
  outline: none;
  box-shadow: inset 0 0 0 1px #007acc;
}

.code-editor::placeholder {
  color: #6a6a6a;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tree-header,
  .content-header,
  .code-header {
    padding: 6px 8px;
    font-size: 12px;
  }

  .header-actions .el-button {
    padding: 4px 8px;
    font-size: 11px;
  }

  .code-editor {
    font-size: 12px;
    padding: 8px;
  }
}
</style>
