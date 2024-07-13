import {createRouter,createWebHashHistory} from 'vue-router'
import basicLayout from '@/components/basicLayout.vue'

//获取views 下所有的文件名称
const files = require.context('@/views', true, /\.vue$/);


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
           
        ]
    }

]
files.keys().forEach(key => {
    routes[0].children.push({
        path: key.replace('./', '/').replace('.vue', ''),
        name: key.replace('./', '').replace('.vue', ''),
        meta: {
            title: key.replace('./', '').replace('.vue', '')
          },
        component: files(key).default
    })
})
export {routes}
// 创建路由实例
const router =  createRouter({
    history:createWebHashHistory(),
    routes:routes
})
export default router