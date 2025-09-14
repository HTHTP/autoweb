<template>
  <div class="app-container">
    <Navbar />
    <main class="product-detail-container">
      <div class="product-main">
        <ProductGallery :images="productImages" />
        <ProductInfo 
          :product-name="productName" 
          :price="price" 
          :original-price="originalPrice"
          :colors="colors"
          :storage-options="storageOptions"
          :stock="stock"
          v-model:selected-color="selectedColor"
          v-model:selected-storage="selectedStorage"
        />
      </div>
      
      <ProductTabs 
        :specifications="specifications"
        :usage-scenarios="usageScenarios"
        :reviews="reviews"
      />
      
      <div class="fixed-add-to-cart" v-if="!isMobile">
        <AddToCartSection 
          :quantity="quantity"
          @update:quantity="updateQuantity"
          @add-to-cart="addToCart"
          @buy-now="buyNow"
        />
      </div>
    </main>
    
    <AfterSalesService :services="afterSalesServices" />
    
    <footer class="footer">
      <div class="container">
        <p>© 2023 SmartWatch Shop. 保留所有权利</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import Navbar from './components/Navbar.vue'
import ProductGallery from './components/ProductGallery.vue'
import ProductInfo from './components/ProductInfo.vue'
import ProductTabs from './components/ProductTabs.vue'
import AddToCartSection from './components/AddToCartSection.vue'
import AfterSalesService from './components/AfterSalesService.vue'

// 响应式判断是否为移动设备
const isMobile = ref(false)

// 产品数据
const productName = 'UltraFit Pro 智能手表 - 全触控健康监测运动手表'
const price = 1299
const originalPrice = 1599
const stock = 256

// 产品图片
const productImages = reactive([
  'https://picsum.photos/id/1/800/800',
  'https://picsum.photos/id/2/800/800',
  'https://picsum.photos/id/3/800/800',
  'https://picsum.photos/id/4/800/800',
  'https://picsum.photos/id/5/800/800'
])

// 规格选项
const colors = reactive([
  { name: '曜石黑', code: '#000000', image: 'https://picsum.photos/id/1/100/100' },
  { name: '冰川银', code: '#E0E0E0', image: 'https://picsum.photos/id/20/100/100' },
  { name: '星空蓝', code: '#1E88E5', image: 'https://picsum.photos/id/21/100/100' }
])

const storageOptions = reactive([
  { name: '4GB', price: 0 },
  { name: '8GB', price: 200 }
])

// 选中的规格
const selectedColor = ref(colors[0])
const selectedStorage = ref(storageOptions[0])
const quantity = ref(1)

// 产品规格参数
const specifications = reactive([
  { category: '基本信息', items: [
    { name: '品牌', value: 'UltraFit' },
    { name: '型号', value: 'Pro-Watch-2023' },
    { name: '上市时间', value: '2023年6月' },
    { name: '产地', value: '中国' }
  ]},
  { category: '显示屏', items: [
    { name: '屏幕尺寸', value: '1.78英寸' },
    { name: '屏幕类型', value: 'AMOLED' },
    { name: '分辨率', value: '368 x 448像素' },
    { name: '触控', value: '多点触控' },
    { name: '亮度', value: '最高1000尼特' }
  ]},
  { category: '性能与存储', items: [
    { name: '处理器', value: '双核处理器' },
    { name: '运行内存', value: '1GB' },
    { name: '存储容量', value: selectedStorage.value.name },
    { name: '操作系统', value: 'UltraOS 3.0' }
  ]},
  { category: '电池与充电', items: [
    { name: '电池容量', value: '300mAh' },
    { name: '续航时间', value: '普通使用7天，重度使用3天' },
    { name: '充电方式', value: '磁吸无线充电' },
    { name: '充电时间', value: '约1.5小时充满' }
  ]},
  { category: '健康与运动', items: [
    { name: '心率监测', value: '24小时实时监测' },
    { name: '血氧监测', value: '支持' },
    { name: '睡眠监测', value: '支持' },
    { name: '运动模式', value: '30+种运动模式' },
    { name: 'GPS', value: '内置GPS' }
  ]}
])

// 使用场景
const usageScenarios = reactive([
  { image: 'https://picsum.photos/id/10/800/600', title: '日常佩戴', description: '时尚设计，适合各种场合' },
  { image: 'https://picsum.photos/id/20/800/600', title: '运动健身', description: '专业运动模式，实时数据监测' },
  { image: 'https://picsum.photos/id/30/800/600', title: '商务办公', description: '消息提醒，提升工作效率' },
  { image: 'https://picsum.photos/id/40/800/600', title: '睡眠监测', description: '全面睡眠质量分析' }
])

// 用户评价
const reviews = reactive([
  { id: 1, user: '张先生', avatar: 'https://picsum.photos/id/64/100/100', rating: 5, date: '2023-08-15', content: '手表非常漂亮，功能齐全，续航也不错，充一次电用了差不多6天。健康监测功能很准，推荐购买！', images: ['https://picsum.photos/id/96/300/300'] },
  { id: 2, user: '李女士', avatar: 'https://picsum.photos/id/65/100/100', rating: 4, date: '2023-08-10', content: '外观时尚，操作流畅，就是价格有点小贵。整体来说还是很满意的，值得购买。', images: [] },
  { id: 3, user: '王先生', avatar: 'https://picsum.photos/id/91/100/100', rating: 5, date: '2023-08-05', content: '功能强大，尤其是运动模式非常全面，跑步时的数据很准确。表带也很舒适，戴着不觉得勒。', images: ['https://picsum.photos/id/97/300/300', 'https://picsum.photos/id/98/300/300'] },
  { id: 4, user: '赵女士', avatar: 'https://picsum.photos/id/62/100/100', rating: 4, date: '2023-07-28', content: '手表颜值很高，配对手机也很方便。APP界面简洁易用，数据统计清晰。', images: ['https://picsum.photos/id/99/300/300'] }
])

// 售后保障服务
const afterSalesServices = reactive([
  { icon: 'el-icon-refresh-left', title: '7天无理由退货', description: '签收后7天内，商品完好可无理由退货' },
  { icon: 'el-icon-shipping', title: '全国联保', description: '官方正品保障，全国联保1年' },
  { icon: 'el-icon-truck', title: '顺丰速运', description: '满99元免运费，顺丰速运配送' },
  { icon: 'el-icon-headset', title: '专业客服', description: '7×24小时在线客服支持' }
])

// 使用场景图片
const usageScenariosImages = reactive([
  'https://picsum.photos/id/26/800/600',
  'https://picsum.photos/id/27/800/600',
  'https://picsum.photos/id/28/800/600',
  'https://picsum.photos/id/29/800/600'
])

// 方法
const updateQuantity = (newQuantity) => {
  quantity.value = newQuantity
}

const addToCart = () => {
  // 显示添加成功消息
  ElMessage.success(`已将 ${productName} (${selectedColor.name} ${selectedStorage.name}) × ${quantity.value} 添加到购物车`)
}

const buyNow = () => {
  // 跳转到结算页面
  ElMessage.info(`准备购买 ${productName} (${selectedColor.name} ${selectedStorage.name}) × ${quantity.value}`)
}

// 检测屏幕尺寸，判断是否为移动设备
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 响应式数据
const isMobile = ref(false)
const productImages = reactive([
  'https://picsum.photos/id/1/800/800',
  'https://picsum.photos/id/2/800/800',
  'https://picsum.photos/id/3/800/800',
  'https://picsum.photos/id/4/800/800',
  'https://picsum.photos/id/5/800/800'
])
</script>

<style scoped lang=