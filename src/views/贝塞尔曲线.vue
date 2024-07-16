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
    const p1 = new THREE.Vector3(-80, 0, 0);
const p2 = new THREE.Vector3(-40, 50, 0);
const p3 = new THREE.Vector3(50, 50, 0);
const p4 = new THREE.Vector3(80, 0, 100);
const arc = new THREE.QuadraticBezierCurve(p1,p2,p3,p4); //


 
    const pointsArr = arc.getPoints(50); //分段数50，返回51个顶点
    const geometry = new THREE.BufferGeometry().setFromPoints(pointsArr);
// 线材质
const material = new THREE.LineBasicMaterial({
    color: 0xff0000 //线条颜色
    ,size:10
});
// 创建线模型对象   构造函数：Line、LineLoop、LineSegments
// const line = new THREE.Line(geometry, material); 
const line = new THREE.Line(geometry, material);//线条模型对象

const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints([p1,p2,p3]);
const material2 = new THREE.PointsMaterial({
    color: 0xff00ff,
    size: 10,
});
const points = new THREE.Points(geometry2, material2)

//创建线材质
const material3 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const line2 = new THREE.Line(geometry2,material3 ); //
scene.add(line2);
scene.add(points);

// const geometry = new THREE.BoxGeometry(100, 100, 100); 
   // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    scene.add(line);
    //创建控制器
// let controls = new OrbitControls(camera, renderer.domElement);
    //创建相机用于拍照
let camera = new THREE.PerspectiveCamera(30, thress.value.clientWidth / thress.value.clientHeight, 1, 3000);
camera.position.set(200,200,200); 
camera.lookAt(line2.position);//指向mesh对应的位置
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