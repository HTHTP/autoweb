<template>
  <div class="about">
    <Header />
    <main class="main-content">
      <div class="about-container">
        <h1>关于我们</h1>
        <p>生成一个面向消费电子类产品（如智能手表）的电商详情页网页。需包含：顶部品牌导航栏 + 搜索框；左侧产品高清轮播图、右侧产品名称 / 价格 / 规格选择器（含库存提示）；中部区域需分标签展示'产品参数'（表格形式）、'使用场景'（3-4 张实拍图）、'用户评价'（带评分 + 晒图的真实评论）；底部设'加入购物车''立即购买'按钮（带数量调整功能）及'售后保障'说明（如 7 天无理由）。整体风格简约现代，色调贴合产品科技感。</p>
        <div class="content">
          <el-row :gutter="20">
            <el-col :span="12">
              <h2>我们的使命</h2>
              <p>致力于创造优秀的用户体验，提供高质量的产品和服务。</p>
            </el-col>
            <el-col :span="12">
              <h2>我们的愿景</h2>
              <p>成为行业领先的技术创新公司，为客户创造价值。</p>
            </el-col>
          </el-row>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.about {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.about-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.content {
  margin-top: 3rem;
}

.content h2 {
  color: #555;
  margin-bottom: 1rem;
}
</style>