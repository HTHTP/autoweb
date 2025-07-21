<template>
  <div class="simple-editable-code">
    <div class="code-header">
      <span>生成的代码</span>
      <div class="header-actions">
        <el-button size="small" @click="copyCode">复制</el-button>
        <el-button size="small" @click="clearCode">清空</el-button>
      </div>
    </div>
    <div class="code-editor-wrapper">
      <textarea
        ref="textareaRef"
        v-model="localValue"
        class="code-editor"
        placeholder="代码将在这里显示..."
        @input="handleInput"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

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

const textareaRef = ref<HTMLTextAreaElement>();
const localValue = ref(props.modelValue || "");

// 监听 props 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localValue.value) {
      localValue.value = newValue || "";
    }
  }
);

// 处理输入变化
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(localValue.value);
    ElMessage.success("代码已复制到剪贴板");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

const clearCode = () => {
  localValue.value = "";
  emit("update:modelValue", "");
  ElMessage.success("代码已清空");
};
</script>

<style scoped>
.simple-editable-code {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.code-editor-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
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
  text-align: left; /* 强制左对齐 */
  direction: ltr; /* 从左到右 */
  white-space: pre; /* 保持空格和换行 */
  word-wrap: normal; /* 不自动换行长单词 */
  overflow-wrap: normal;
  tab-size: 2; /* Tab 缩进大小 */
  box-sizing: border-box;
}

.code-editor:focus {
  outline: none;
  box-shadow: inset 0 0 0 1px #007acc;
}

.code-editor::placeholder {
  color: #6a6a6a;
  font-style: italic;
}
</style>
