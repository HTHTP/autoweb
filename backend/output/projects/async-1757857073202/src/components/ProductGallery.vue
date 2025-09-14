<template>
  <div class="product-gallery">
    <el-carousel 
      class="main-carousel" 
      height="500px" 
      indicator-position="none"
      v-model:current-index="currentIndex"
    >
      <el-carousel-item v-for="(image, index) in images" :key="index">
        <div class="carousel-image-container">
          <img 
            :src="image" 
            :alt="`产品图片 ${index + 1}`" 
            class="product-image"
            @click="openImageViewer(index)"
          />
        </div>
      </el-carousel-item>
    </el-carousel>
    
    <div class="thumbnail-list">
      <div 
        class="thumbnail-item"
        v-for="(image, index) in images" 
        :key="index"
        :class="{ active: currentIndex === index }"
        @click="currentIndex = index"
      >
        <img :src="image" :alt="`缩略图 ${index + 1}`" class="thumbnail-image" />
      </div>
    </div>
    
    <!-- 图片查看器 -->
    <el-image-viewer 
      v-if="showImageViewer" 
      :url-list="images" 
      :initial-index="imageViewerIndex"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElImageViewer } from 'element-plus'

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
})

const currentIndex = ref(0)
const showImageViewer = ref(false)
const imageViewerIndex = ref(0)

const openImageViewer = (index) => {
  imageViewerIndex.value = index
  showImageViewer.value = true
}
</script>

<style scoped lang=