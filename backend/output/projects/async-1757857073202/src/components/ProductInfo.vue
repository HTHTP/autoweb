<template>
  <div class="product-info">
    <h1 class="product-name">{{ productName }}</h1>
    
    <div class="price-section">
      <span class="current-price">¥{{ finalPrice.toLocaleString() }}</span>
      <span class="original-price">¥{{ originalPrice.toLocaleString() }}</span>
      <span class="discount-tag">{{ Math.round((1 - price/originalPrice) * 100) }}% OFF</span>
    </div>
    
    <div class="product-short-desc">
      全触控高清大屏 | 7天超长续航 | 50米防水 | 多运动模式 | 心率血氧监测
    </div>
    
    <div class="spec-selection">
      <div class="spec-item">
        <span class="spec-label">颜色</span>
        <div class="color-options">
          <div 
            class="color-option"
            v-for="color in colors" 
            :key="color.name"
            :class="{ selected: selectedColor.name === color.name }"
            @click="selectColor(color)"
          >
            <div 
              class="color-swatch"
              :style="{ backgroundColor: color.code }"
              :title="color.name"
            ></div>
            <span class="color-name">{{ color.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="spec-item">
        <span class="spec-label">存储容量</span>
        <div class="storage-options">
          <el-radio-group v-model="selectedStorage.name" class="radio-group">
            <el-radio-button 
              v-for="option in storageOptions" 
              :key="option.name" 
              :label="option.name"
              :disabled="!option.stock || option.stock <= 0"
            >
              {{ option.name }} 
              <span v-if="option.price > 0">+¥{{ option.price }}</span>
              <span v-if="!option.stock || option.stock <= 0" class="stock-out">缺货</span>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
    
    <div class="stock-info">
      <el-icon><Inventory /></el-icon>
      <span>库存: {{ stock }}件</span>
    </div>
    
    <div class="add-to-cart-mobile" v-if="isMobile">
      <AddToCartSection 
        :quantity="quantity"
        @update:quantity="updateQuantity"
        @add-to-cart="addTocart"
        @buy-now="buyNow"
      />
    </div>
    
    <div class="service-tags">
      <span class="tag">正品保障</span>
      <span class="tag">7天无理由退货</span>
      <span class="tag">全国联保</span>
      <span class="tag">顺丰速运</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Inventory } from '@element-plus/icons-vue'
import AddToCartSection from './AddToCartSection.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  colors: {
    type: Array,
    required: true
  },
  storageOptions: {
    type: Array,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  'modelValue:selectedColor': {
    type: Object,
    required: true
  },
  'modelValue:selectedStorage': {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:selectedColor', 'update:selectedStorage'])

// 响应式数据
const selectedColor = ref(props['modelValue:selectedColor'])
const selectedStorage = ref(props['modelValue:selectedStorage'])
const quantity = ref(1)
const isMobile = ref(false)

// 计算最终价格（基础价格 + 存储容量加价）
const finalPrice = computed(() => {
  return props.price + (selectedStorage.value.price || 0)
})

// 方法
const selectColor = (color) => {
  selectedColor.value = color
  emit('update:selectedColor', color)
}

const updateQuantity = (newQuantity) => {
  quantity.value = newQuantity
}

const addTocart = () => {
  emit('add-to-cart', {
    color: selectedColor.value,
    storage: selectedStorage.value,
    quantity: quantity.value
  })
}

const buyNow = () => {
  emit('buy-now', {
    color: selectedColor.value,
    storage: selectedStorage.value,
    quantity: quantity.value
  })
}

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 监听选中的存储选项变化
watch(() => selectedStorage.value, (newVal) => {
  emit('update:selectedStorage', newVal)
})
</script>

<style scoped lang=