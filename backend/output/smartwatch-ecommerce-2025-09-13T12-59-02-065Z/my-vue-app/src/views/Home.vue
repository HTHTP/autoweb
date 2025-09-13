<template>
  <div class="home">
    <Header />
    <main class="main-content">
      <section class="hero">
        <h1>欢迎来到我的网站</h1>
        <p>生成一个面向消费电子类产品（如智能手表）的电商详情页网页。需包含：顶部品牌导航栏 + 搜索框；左侧产品高清轮播图、右侧产品名称 / 价格 / 规格选择器（含库存提示）；中部区域需分标签展示'产品参数'（表格形式）、'使用场景'（3-4 张实拍图）、'用户评价'（带评分 + 晒图的真实评论）；底部设'加入购物车''立即购买'按钮（带数量调整功能）及'售后保障'说明（如 7 天无理由）。整体风格简约现代，色调贴合产品科技感。</p>
        <el-button type="primary" size="large">开始探索</el-button>
      </section>
      
      <section class="features">
        <el-row :gutter="20">
          <el-col :span="8" v-for="feature in features" :key="feature.id">
            <el-card class="feature-card">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const features = ref([
  { id: 1, title: '功能一', description: '这是功能一的描述' },
  { id: 2, title: '功能二', description: '这是功能二的描述' },
  { id: 3, title: '功能三', description: '这是功能三的描述' }
])
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.features {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
</style>