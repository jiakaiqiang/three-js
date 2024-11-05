import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

if (window.__POWERED_BY_WUJIE__) {
  let instance;
  window.__WUJIE_MOUNT = () => {
    const router = createRouter({ history: createWebHistory(), routes });
    instance = createApp(App);
    instance.use(router);
    instance.use(ElementPlus)
    // 全局注册icon（后期可优化，按需注册）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  instance.component(key, component)
}

    instance.mount("#app");
  };
  window.__WUJIE_UNMOUNT = () => {
    instance.unmount();
  };
} else {
  const app  =  createApp(App)
app.use(router)
app.use(ElementPlus)
// 全局注册icon（后期可优化，按需注册）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
app.mount('#app')
}



