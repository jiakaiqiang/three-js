<template>
  <div ref="thress" style="height:100%;width:100%" ></div>
</template>

<script  setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const thress = ref(null);
const scene = new THREE.Scene();
let renderer
  const init = () =>{
    // 创建几个模型
    const geometry =  new THREE.BufferGeometry()
    //定义位置数据
    const vertices = new Float32Array([
    0, 0, 0, //顶点1坐标
    50, 0, 0, //顶点2坐标
    0, 25, 0, //顶点3坐标
]);
//设置顶点的坐标数据

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));


const colors = new Float32Array([
    1, 0, 0, //顶点1颜色
    0, 0, 1, //顶点2颜色
    0, 1, 0, //顶点3颜色
]);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const material = new THREE.MeshBasicMaterial({
    // color: 0x333333,//使用顶点颜色数据，color属性可以不用设置
    vertexColors:true,//默认false，设置为true表示使用顶点颜色渲染
    size: 20.0, //点对象像素尺寸
});
const points = new THREE.Mesh(geometry, material); //点模型对象
scene.add(points);
 
    //创建相机用于拍照
let camera = new THREE.PerspectiveCamera(30, thress.value.clientWidth / thress.value.clientHeight, 1, 3000);
camera.position.set(200,200,200); 
camera.lookAt(points.position);//指向mesh对应的位置
//创建渲染器
camera.up.set(0, 0, 1);//设置相机上方向
scene.add(camera)


 renderer = new THREE.WebGLRenderer({antialias:true,//想把canvas画布上内容下载到本地，需要设置为true
    preserveDrawingBuffer:true,});
renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
renderer.render(scene, camera); 
//將渲染器添加到DOM中
thress.value.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
// 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
controls.addEventListener('change', function () {
    renderer.render(scene, camera); //执行渲染操作
    
});//监听鼠标、键盘事件
  }

onMounted(() => {
  init()


 })
</script>

<style scoped lang='less' >
/* Your styles here */
</style>