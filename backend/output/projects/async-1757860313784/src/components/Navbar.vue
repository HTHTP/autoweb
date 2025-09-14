<template>
  <header class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- 品牌Logo -->
        <div class="brand-logo">
          <h1>SmartWatch</h1>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <ul>
            <li><a href="#" class="nav-link active">首页</a></li>
            <li><a href="#" class="nav-link">产品系列</a></li>
            <li><a href="#" class="nav-link">配件</a></li>
            <li><a href="#" class="nav-link">支持</a></li>
            <li><a href="#" class="nav-link">关于我们</a></li>
          </ul>
        </nav>
        
        <!-- 搜索框和购物车 -->
        <div class="nav-actions">
          <div class="search-box">
            <el-input 
              placeholder="搜索产品..." 
              prefix-icon="el-icon-search"
              size="small"
              class="search-input"
            />
          </div>
          <div class="cart-icon">
            <el-badge :value="cartCount" class="item">
              <el-icon size="24"><shopping-cart /></el-icon>
            </el-badge>
          </div>
          <div class="user-icon">
            <el-icon size="24"><user /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { ShoppingCart, User } from '@element-plus/icons-vue'

const cartCount = ref(2)
</script>

<style scoped>
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.brand-logo h1 {
  margin: 0;
  font-size: 24px;
  color: var(--primary-color);
  font-weight: 700;
}

.nav-menu ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
  padding: 5px 0;
  position: relative;
}

.nav-link.active {
  color: var(--primary-color);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 200px;
}

.search-input .el-input__wrapper {
  border-radius: 20px;
  background-color: #f5f5f5;
}

.cart-icon, .user-icon {
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.cart-icon:hover, .user-icon:hover {
  color: var(--primary-color);
}
</style>