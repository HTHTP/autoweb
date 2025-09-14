<template>
  <div class="product-gallery">
    <!-- 缩略图 -->
    <div class="thumbnail-list" v-if="images.length > 1">
      <div 
        v-for="(img, index) in images" 
        :key="index"
        class="thumbnail-item"
        :class="{ active: activeIndex === index }"
        @click="activeIndex = index"
      >
        <img :src="img" :alt="`产品图片 ${index+1}`" class="thumbnail-img" />
      </div>
    </div>
    
    <!-- 主图展示 -->
    <div class="main-image-container">
      <el-image 
        :src="images[activeIndex]" 
        :alt="'产品主图'"
        class="main-image"
        fit="contain"
        preview-teleported
        :preview-src-list="images"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  }
})

const activeIndex = ref(0)
</script>

<style scoped>
.product-gallery {
  display: flex;
  flex-direction: column;
  width: 40%;
}

.thumbnail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail-item.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-image-container {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.3s ease;
}

.main-image:hover {
  transform: scale(1.02);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .product-gallery {
    width: 100%;
  }
  
  .thumbnail-list {
    flex-direction: row;
    justify-content: center;
    order: 2;
  }
  
  .main-image-container {
    order: 1;
    margin-bottom: 15px;
  }
}
</style>