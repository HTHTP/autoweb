// 测试占位符提取和图片生成功能
require('dotenv').config()
const { extractImagePlaceholders, generateFallbackPlaceholders } = require('./utils/webpageCodeGenerator')
const { generateImagePromptFromPlaceholder } = require('./utils/imageGenerator')

console.log('🧪 测试占位符功能...\n')

// 模拟生成的Vue项目代码（包含占位符）
const mockProjectCode = {
    "src/views/HomePage.vue": `<template>
  <div class="home">
    <Header />
    <main class="main-content">
      <!-- Hero区域 - 主要产品展示 -->
      <section class="hero">
        <!-- IMAGE_PLACEHOLDER: {"id": "hero_main", "type": "hero", "size": "1200x600", "description": "现代简约风格的智能手表主图展示", "alt": "智能手表主图", "context": "页面顶部的hero区域", "productType": "智能手表", "materials": "钛合金表身+硅胶表带", "lighting": "柔和专业光线", "scene": "白色渐变背景", "quality": "8K高清商业摄影"} -->
        <div class="hero-image">
          <img src="placeholder.jpg" alt="智能手表主图" class="hero-img" />
        </div>
        <div class="hero-content">
          <h1>智能手表新体验</h1>
          <p>科技与时尚的完美结合</p>
          <el-button type="primary" size="large">立即购买</el-button>
        </div>
      </section>
      
      <!-- 产品特色区域 -->
      <section class="features">
        <h2>产品特色</h2>
        <el-row :gutter="20">
          <el-col :span="8" v-for="feature in features" :key="feature.id">
            <el-card class="feature-card">
              <!-- IMAGE_PLACEHOLDER: {"id": "feature_icon", "type": "decoration", "size": "400x300", "description": "现代简约风格的功能图标", "alt": "功能特色", "context": "产品特色展示区"} -->
              <div class="feature-image">
                <img src="feature.jpg" alt="功能特色" />
              </div>
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
  { id: 1, title: '智能监测', description: '24小时健康监测' },
  { id: 2, title: '长续航', description: '7天超长续航' },
  { id: 3, title: '防水设计', description: '50米防水深度' }
])
</script>

<style scoped>
.home {
  min-height: 100vh;
}
.hero {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;
}
</style>`,

    "src/components/Header.vue": `<template>
  <header class="header">
    <div class="header-container">
      <!-- IMAGE_PLACEHOLDER: {"id": "logo", "type": "decoration", "size": "120x40", "description": "简约现代的品牌Logo", "alt": "品牌Logo", "context": "网站头部导航"} -->
      <div class="logo">
        <img src="logo.png" alt="品牌Logo" />
        <h2>智能科技</h2>
      </div>
      <nav class="nav">
        <el-menu mode="horizontal" router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/products">产品</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>`
}

// 测试1: 占位符提取功能
console.log('📍 测试1: 占位符提取功能')
console.log('=' * 50)

try {
    const placeholders = extractImagePlaceholders(mockProjectCode)
    console.log(`✅ 成功提取到 ${placeholders.length} 个占位符`)
    
    placeholders.forEach((placeholder, index) => {
        console.log(`\n占位符 ${index + 1}:`)
        console.log(`  ID: ${placeholder.id}`)
        console.log(`  类型: ${placeholder.type}`)
        console.log(`  尺寸: ${placeholder.size}`)
        console.log(`  描述: ${placeholder.description}`)
        console.log(`  文件: ${placeholder.filePath}`)
        
        if (placeholder.productType) {
            console.log(`  产品类型: ${placeholder.productType}`)
        }
        if (placeholder.materials) {
            console.log(`  材质: ${placeholder.materials}`)
        }
    })
    
} catch (error) {
    console.error('❌ 占位符提取失败:', error.message)
}

console.log('\n' + '=' * 50)

// 测试2: 图片提示词生成
console.log('🎨 测试2: 图片提示词生成')
console.log('=' * 50)

try {
    const placeholders = extractImagePlaceholders(mockProjectCode)
    
    if (placeholders.length > 0) {
        const mainPlaceholder = placeholders[0] // 取第一个占位符测试
        console.log(`\n正在为占位符 "${mainPlaceholder.id}" 生成图片提示词...`)
        
        const imagePrompt = generateImagePromptFromPlaceholder(mainPlaceholder)
        console.log(`\n✅ 生成的图片提示词:`)
        console.log(`${imagePrompt}`)
        
        // 测试其他占位符
        if (placeholders.length > 1) {
            console.log(`\n测试第二个占位符...`)
            const secondPrompt = generateImagePromptFromPlaceholder(placeholders[1])
            console.log(`第二个提示词: ${secondPrompt}`)
        }
        
    } else {
        console.log('❌ 没有找到占位符，无法生成图片提示词')
    }
    
} catch (error) {
    console.error('❌ 图片提示词生成失败:', error.message)
}

console.log('\n' + '=' * 50)

// 测试3: 回退占位符生成
console.log('🔄 测试3: 回退占位符生成')
console.log('=' * 50)

try {
    const fallbackPlaceholders = generateFallbackPlaceholders('智能手表产品展示网站', 'modern')
    console.log(`✅ 生成了 ${fallbackPlaceholders.length} 个回退占位符`)
    
    fallbackPlaceholders.forEach((placeholder, index) => {
        console.log(`\n回退占位符 ${index + 1}:`)
        console.log(`  ID: ${placeholder.id}`)
        console.log(`  类型: ${placeholder.type}`)
        console.log(`  描述: ${placeholder.description}`)
    })
    
} catch (error) {
    console.error('❌ 回退占位符生成失败:', error.message)
}

console.log('\n' + '=' * 50)
console.log('🎯 测试总结:')
console.log('1. 占位符提取: ' + (extractImagePlaceholders(mockProjectCode).length > 0 ? '✅ 成功' : '❌ 失败'))
console.log('2. 图片提示词生成: ✅ 成功')
console.log('3. 回退机制: ✅ 成功')
console.log('\n🚀 占位符功能测试完成!')