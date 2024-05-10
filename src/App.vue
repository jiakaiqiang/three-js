<script setup>

import Menu from './components/menu.vue'



</script>

<template>
  <el-container>
    <el-aside>
      <Menu />
    </el-aside>
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<style scoped>
.el-header {
  height: 30px;
}
.el-container {
  height: 100vh;
}
.el-main {
  padding: 0 !important;
  position: relative;
}
.el-aside {
  width: auto;
}
</style>