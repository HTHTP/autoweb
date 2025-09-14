<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <div class="brand-logo">
          <h1>UltraFit</h1>
        </div>
        
        <div class="nav-menu">
          <ul>
            <li><a href="#" class="active">智能手表</a></li>
            <li><a href="#">手环</a></li>
            <li><a href="#">耳机</a></li>
            <li><a href="#">配件</a></li>
            <li><a href="#">支持</a></li>
          </ul>
        </div>
        
        <div class="nav-actions">
          <div class="search-box">
            <el-input 
              placeholder="搜索产品..." 
              prefix-icon="el-icon-search"
              size="small"
              class="search-input"
            />
          </div>
          
          <div class="action-icons">
            <button class="icon-btn" aria-label="用户中心">
              <el-icon><User /></el-icon>
            </button>
            <button class="icon-btn" aria-label="购物车">
              <el-icon><ShoppingCart /></el-icon>
              <span class="cart-badge">3</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { User, ShoppingCart } from '@element-plus/icons-vue'
import { ref } from 'vue'

const isMenuOpen = ref(false)
</script>

<style scoped lang=