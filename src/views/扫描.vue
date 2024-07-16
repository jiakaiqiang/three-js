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
    const shape = new THREE.Shape([
    // 按照特定顺序，依次书写多边形顶点坐标
    new THREE.Vector2(0,0), //多边形起点
    new THREE.Vector2(0,10),
    new THREE.Vector2(10,10),
    new THREE.Vector2(10,0),
]);
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -10, -50, -50 ),
    new THREE.Vector3( 10, 0, 0 ),
    new THREE.Vector3( 8, 50, 50 ),
    new THREE.Vector3( -5, 0, 100)
]);
const geometry = new THREE.ExtrudeGeometry(
    shape, //扫描轮廓
    {
        extrudePath:curve,//扫描轨迹
        steps:100//沿着路径细分精度，越大越光滑
    }
);

   
// 线材质
const material = new THREE.MeshBasicMaterial({
    wireframe:true,
});

const Mesh = new THREE.Mesh(geometry, material);




    scene.add(Mesh);
 
    //创建相机用于拍照
let camera = new THREE.PerspectiveCamera(30, thress.value.clientWidth / thress.value.clientHeight, 1, 3000);
camera.position.set(200,200,200); 
camera.lookAt(Mesh.position);//指向mesh对应的位置

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