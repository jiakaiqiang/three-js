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
 // Vector2表示的三个点坐标，三个点构成的轮廓相当于两端直线相连接
// const pointsArr = [
//     new THREE.Vector2(50, 60),
//     new THREE.Vector2(25, 0),
//     new THREE.Vector2(50, 0),
//     new THREE.Vector2(90, -23)
// ];

const curve = new THREE.SplineCurve([
    new THREE.Vector2(50, 60),
    new THREE.Vector2(25, 0),
    new THREE.Vector2(50, -60)
]);
const pointsArr = curve.getPoints(50); 

// LatheGeometry：pointsArr轮廓绕y轴旋转生成几何体曲面
// pointsArr：旋转几何体的旋转轮廓形状
const geometry = new THREE.LatheGeometry(pointsArr, 30);
   
// 线材质
const material = new THREE.LineBasicMaterial({
    color: 0xff0000 //线条颜色
    ,size:10
});

const line = new THREE.Line(geometry, material);//线条模型对象




    scene.add(line);
 
    //创建相机用于拍照
let camera = new THREE.PerspectiveCamera(30, thress.value.clientWidth / thress.value.clientHeight, 1, 3000);
camera.position.set(200,200,200); 
camera.lookAt(line.position);//指向mesh对应的位置
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