<template>
  <div class="app-container">
    <el-card class="main-card">
      <h1>🎉 AI生成的Vue3应用</h1>
      <p>用户需求：成一个面向消费电子类产品（如智能手表）的电商详情页网页。需包含：顶部品牌导航栏 + 搜索框；左侧产品高清轮播图、右侧产品名称 / 价格 / 规格选择器（含库存提示）；中部区域需分标签展示‘产品参数’（表格形式）、‘使用场景’（3-4 张实拍图）、‘用户评价’（带评分 + 晒图的真实评论）；底部设‘加入购物车’‘立即购买’按钮（带数量调整功能）及‘售后保障’说明（如 7 天无理由）。整体风格简约现代，色调贴合产品科技感</p>
      <el-divider />
      <div class="feature-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input v-model="inputText" placeholder="请输入内容" />
          </el-col>
          <el-col :span="12">
            <el-button type="primary" @click="handleClick">确认</el-button>
          </el-col>
        </el-row>
      </div>
      <div v-if="message" class="message-area">
        <el-alert :title="message" type="success" show-icon />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const message = ref('')

const handleClick = () => {
  if (inputText.value.trim()) {
    message.value = `您输入了：${inputText.value}`
    ElMessage.success('操作成功')
  } else {
    ElMessage.warning('请输入内容')
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.main-card {
  max-width: 800px;
  width: 100%;
}

.feature-section {
  margin: 20px 0;
}

.message-area {
  margin-top: 20px;
}

h1 {
  color: #409eff;
  text-align: center;
  margin-bottom: 20px;
}

p {
  text-align: center;
  color: #606266;
  font-size: 16px;
}
</style>