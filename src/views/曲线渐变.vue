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
    const arr = [
    new THREE.Vector3(-50, 20, 90),
    new THREE.Vector3(-10, 40, 40),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(60, -60, 0),
    new THREE.Vector3(70, 0, 80)
]
const arc = new THREE.CatmullRomCurve3(arr); //SplineCurve 平面 CatmullRomCurve3 3D曲线


 
    const pointsArr = arc.getPoints(50); //分段数50，返回51个顶点
    const geometry = new THREE.BufferGeometry().setFromPoints(pointsArr);
// 线材质
const material = new THREE.LineBasicMaterial({
    vertexColors: true, //使用顶点颜色渲染
});
const pos = geometry.attributes.position;
const count = pos.count; //顶点数量
// 计算每个顶点的颜色值
const colorsArr = [];
for (let i = 0; i < count; i++) {
    const percent = i / count; //点索引值相对所有点数量的百分比
    //根据顶点位置顺序大小设置颜色渐变
    // 红色分量从0到1变化，蓝色分量从1到0变化
    colorsArr.push(percent, 0, 1 - percent); //蓝色到红色渐变色
}
//类型数组创建顶点颜色color数据
const colors = new Float32Array(colorsArr);
// 设置几何体attributes属性的颜色color属性
geometry.attributes.color = new THREE.BufferAttribute(colors, 3);
const line = new THREE.Line(geometry, material);//线条模型对象





    scene.add(line);
    //创建控制器
// let controls = new OrbitControls(camera, renderer.domElement);
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