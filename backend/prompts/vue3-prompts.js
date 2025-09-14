/**
 * Vue3代码生成提示词模板
 * 用于指导AI生成高质量的Vue3组件和完整项目
 */

const VUE3_GENERATION_PROMPT = `你是一个专业的Vue3前端开发专家，擅长使用Vue3 + Element Plus创建现代化的web应用。

用户的需求描述：{userDescription}

请根据用户需求，生成一个完整的Vue3项目，要求如下：

## 项目结构要求
1. 生成一个完整的Vue3项目结构，包含所有必要的配置文件
2. 使用Vue3 Composition API语法
3. 集成Element Plus UI组件库
4. 使用现代化的CSS样式和布局
5. 确保代码结构清晰，组件复用性强

## 技术栈要求
- Vue 3.5+ (Composition API)
- Element Plus 2.10+
- Vite 6.0+
- TypeScript支持（可选）
- 现代化CSS（Flexbox/Grid布局）

## 代码质量要求
1. 代码语法正确，能够正常运行
2. 组件设计合理，功能完整
3. 样式美观，响应式设计
4. 注释清晰，变量命名规范
5. 遵循Vue3最佳实践

## 输出格式
请以JSON格式输出完整的项目文件结构，格式如下：
{
  "项目名称/package.json": "package.json内容",
  "项目名称/index.html": "HTML内容",
  "项目名称/vite.config.js": "Vite配置",
  "项目名称/src/main.js": "Vue3入口文件",
  "项目名称/src/App.vue": "主组件",
  "项目名称/src/components/ComponentName.vue": "其他组件"
}

## 特别注意
1. 根据用户需求灵活生成组件，不要使用固定模板
2. 充分利用Element Plus组件库
3. 确保生成的代码可以直接运行
4. 样式要现代化且美观
5. 如果用户描述不够详细，请合理推测并实现基础功能

请开始生成代码：`;

const VUE3_MODIFICATION_PROMPT = `你是一个专业的Vue3前端开发专家，现在需要根据用户的修改要求来更新现有的Vue3代码。

## 当前代码
{currentCode}

## 用户的修改要求
{modificationRequest}

## 修改指导原则
1. 保持现有代码的基本结构和风格
2. 只修改必要的部分，避免不必要的改动
3. 确保修改后的代码语法正确，功能完整
4. 保持Vue3最佳实践和代码规范
5. 如果是样式修改，要保持整体设计的一致性

## 输出要求
请输出修改后的完整代码，保持与输入相同的JSON格式。确保：
- 所有修改都符合用户要求
- 代码能够正常运行
- 保持良好的代码结构和可读性

请开始修改代码：`;

const COMPONENT_TEMPLATES = {
  // 基础组件模板
  basic: {
    template: `<template>
  <div class="{{componentName}}">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('{{title}}')
const description = ref('{{description}}')
</script>

<style scoped>
.{{componentName}} {
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
}
</style>`,
    variables: ['componentName', 'title', 'description']
  },

  // 表单组件模板
  form: {
    template: `<template>
  <div class="{{componentName}}">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      {{formFields}}
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref()
const form = reactive({
  {{formData}}
})

const rules = reactive({
  {{formRules}}
})

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('提交成功')
      // 处理表单提交逻辑
    }
  })
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.{{componentName}} {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>`,
    variables: ['componentName', 'formFields', 'formData', 'formRules']
  },

  // 数据展示组件模板
  table: {
    template: `<template>
  <div class="{{componentName}}">
    <div class="table-header">
      <h3>{{title}}</h3>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%">
      {{tableColumns}}
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([
  {{tableData}}
])

const handleAdd = () => {
  ElMessage.info('新增功能待实现')
}

const handleEdit = (row) => {
  ElMessage.info(\`编辑：\${row.name}\`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}
</script>

<style scoped>
.{{componentName}} {
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>`,
    variables: ['componentName', 'title', 'tableColumns', 'tableData']
  }
};

const STYLE_THEMES = {
  modern: {
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    background: '#f8f9fa',
    cardShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px'
  },
  dark: {
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    background: '#1a1a1a',
    cardShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
    borderRadius: '8px'
  },
  minimal: {
    primary: '#606266',
    success: '#909399',
    warning: '#c0c4cc',
    danger: '#f56c6c',
    background: '#ffffff',
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    borderRadius: '4px'
  }
};

module.exports = {
  VUE3_GENERATION_PROMPT,
  VUE3_MODIFICATION_PROMPT,
  COMPONENT_TEMPLATES,
  STYLE_THEMES
};