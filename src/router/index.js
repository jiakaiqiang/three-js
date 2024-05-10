import {createRouter,createWebHashHistory} from 'vue-router'
import basicLayout from '@/components/basicLayout.vue'
let routes =[
    {
        path:'/',
        name:'basicLayout',
        meta: {
            title: "基础"
          },
        component:basicLayout,
        redirect:'/init',
        children:[
            {
                path:'/init',
                name:'init',
                meta: {
                    title: "初始化"
                  },
                component:()=>import('@/views/init.vue')
            },
            {
                path:'/login',
                name:'login',
                meta: {
                    title: "图层"
                  },
                component:()=>import('@/views/login.vue')
            }
        ]
    }

]
export {routes}
// 创建路由实例
const router =  createRouter({
    history:createWebHashHistory(),
    routes:routes
})
export default router