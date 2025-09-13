<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <h2>我的网站</h2>
      </div>
      <nav class="nav">
        <el-menu mode="horizontal" :default-active="$route.path" router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>
      </nav>
    </div>
  </header>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo h2 {
  color: #333;
  margin: 0;
}

.nav {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}
</style>