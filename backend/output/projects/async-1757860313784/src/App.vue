<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <Navbar />
    
    <!-- 主内容区 -->
    <main class="product-detail-container">
      <div class="container">
        <!-- 产品图片和基本信息 -->
        <div class="product-main-info">
          <ProductGallery :images="productImages" />
          <ProductInfo 
            :product-name="productName" 
            :product-price="productPrice" 
            :original-price="originalPrice"
            :colors="colors"
            :storage-options="storageOptions"
            :selected-color="selectedColor"
            :selected-storage="selectedStorage"
            :stock="stock"
            @color-change="handleColorChange"
            @storage-change="handleStorageChange"
          />
        </div>
        
        <!-- 产品详情标签页 -->
        <ProductTabs />
        
        <!-- 加入购物车和购买区域 -->
        <AddToCartSection 
          :quantity="quantity" 
          @quantity-change="handleQuantityChange"
          @add-to-cart="handleAddToCart"
          @buy-now="handleBuyNow"
        />
        
        <!-- 售后保障 -->
        <AfterSaleService :services="afterSaleServices" />
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>© 2023 SmartWatch Store. 保留所有权利</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import ProductGallery from './components/ProductGallery.vue'
import ProductInfo from './components/ProductInfo.vue'
import ProductTabs from './components/ProductTabs.vue'
import AddToCartSection from './components/AddToCartSection.vue'
import AfterSaleService from './components/AfterSaleService.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 产品数据
const productName = 'Ultra智能手表 Pro X'
const productPrice = 1299
const originalPrice = 1599
const productImages = [
  'https://picsum.photos/id/1/800/800',
  'https://picsum.photos/id/2/800/800',
  'https://picsum.photos/id/3/800/800',
  'https://picsum.photos/id/4/800/800'
]

// 规格选项
const colors = [
  { id: 1, name: '曜石黑', code: '#0A0A0A', image: 'https://picsum.photos/id/1/100/100' },
  { id: 2, name: '冰川银', code: '#E0E0E0', image: 'https://picsum.photos/id/2/100/100' },
  { id: 3, name: '星空蓝', code: '#1A5276', image: 'https://picsum.photos/id/3/100/100' }
]

const storageOptions = [
  { id: 1, size: '42mm', price: 1299 },
  { id: 2, size: '46mm', price: 1499 }
]

// 选中状态
const selectedColor = ref(colors[0])
const selectedStorage = ref(storageOptions[0])
const stock = ref(128)
const quantity = ref(1)

// 产品图片
const productImages = ref([
  'https://picsum.photos/id/1/800/800',
  'https://picsum.photos/id/20/800/800',
  'https://picsum.photos/id/21/800/800',
  'https://picsum.photos/id/22/800/800'
])

// 售后保障服务
const afterSaleServices = ref([
  { icon: 'el-icon-refresh-left', title: '7天无理由退货', description: '签收后7天内，商品完好可无理由退货' },
  { icon: 'el-icon-shield', title: '两年官方保修', description: '享受原厂提供的两年质保服务' },
  { icon: 'el-icon-truck', title: '免运费配送', description: '全国范围内免费配送' },
  { icon: 'el-icon-exchange', title: '30天价格保护', description: '购买后30天内降价可申请差价退还' }
])

// 方法
const handleColorChange = (color) => {
  selectedColor.value = color
}

const handleStorageChange = (storage) => {
  selectedStorage.value = storage
}

const handleQuantityChange = (val) => {
  quantity.value = val
}

const handleAddToCart = () => {
  ElMessage.success(`已将 ${productName} (${selectedColor.value.name} ${selectedStorage.value.size}) x ${quantity.value} 加入购物车`)
}

const handleBuyNow = () => {
  ElMessage.success(`立即购买: ${productName} (${selectedColor.value.name} ${selectedStorage.value.size}) x ${quantity.value}`)
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.product-detail-container {
  flex: 1;
  padding: 30px 0;
  background-color: #f9f9f9;
}

.container {
  width: 1200px;
  margin: 0 auto;
}

.product-main-info {
  display: flex;
  gap: 40px;
  margin-bottom: 50px;
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.footer {
  background-color: #1a1a1a;
  color: #fff;
  padding: 40px 0;
  margin-top: 60px;
}

.footer p {
  text-align: center;
  margin: 0;
}
</style>