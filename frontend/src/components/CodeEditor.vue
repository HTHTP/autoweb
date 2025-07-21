<template>
  <div class="code-editor">
    <div class="editor-header">
      <span class="editor-title">生成的代码</span>
      <div class="editor-actions">
        <el-button size="small" @click="copyCode">
          <el-icon><CopyDocument /></el-icon>
          复制代码
        </el-button>
        <el-button size="small" @click="formatCode">
          <el-icon><Promotion /></el-icon>
          格式化
        </el-button>
      </div>
    </div>
    <div ref="editorContainer" class="editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { CopyDocument, Promotion } from "@element-plus/icons-vue";
import * as monaco from "monaco-editor";

interface Props {
  modelValue: string;
  language?: string;
  readonly?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  language: "html",
  readonly: false,
});

const emit = defineEmits<Emits>();

const editorContainer = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(async () => {
  await nextTick();
  initEditor();
});

const initEditor = () => {
  if (!editorContainer.value) return;

  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: "vs-dark",
    readOnly: props.readonly,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    wordWrap: "on",
  });

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      emit("update:modelValue", editor.getValue());
    }
  });
};

// 监听 props 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue);
    }
  }
);

watch(
  () => props.language,
  (newLanguage) => {
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
      }
    }
  }
);

const copyCode = async () => {
  if (editor) {
    try {
      await navigator.clipboard.writeText(editor.getValue());
      ElMessage.success("代码已复制到剪贴板");
    } catch (error) {
      ElMessage.error("复制失败");
    }
  }
};

const formatCode = () => {
  if (editor) {
    editor.getAction("editor.action.formatDocument")?.run();
    ElMessage.success("代码已格式化");
  }
};
</script>

<style scoped>
.code-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.editor-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-container {
  height: 400px;
}
</style>
