<template>
  <div class="product-info">
    <!-- 产品名称 -->
    <h1 class="product-name">{{ productName }}</h1>
    
    <!-- 产品价格 -->
    <div class="price-section">
      <span class="current-price">¥{{ productPrice.toLocaleString() }}</span>
      <span class="original-price">¥{{ originalPrice.toLocaleString() }}</span>
      <span class="discount-tag">限时优惠</span>
    </div>
    
    <!-- 评分和销量 -->
    <div class="product-meta">
      <div class="rating">
        <el-rate v-model=