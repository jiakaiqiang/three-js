<template>
  <div ref="thress" class="three-dom"></div>
 </template>
     
 
 <script setup>
 import {ref,onMounted} from 'vue';
 import * as THREE from 'three';
 import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
 const thress =  ref(null)
 const scene =  new THREE.Scene({
  color:'white'
 });
 // 创建GLTF加载器对象
const loader = new GLTFLoader();
 function init(){
     //创建物体形状
  //const geometry =  new THREE.BoxGeometry(100,100,100)
 
 // //创建材质
 // const  marterial =  new THREE.MeshBasicMaterial({color:"red"})
 const geometry = new THREE.PlaneGeometry(60, 60);
 const textureLoader = new THREE.TextureLoader();
 const material = new THREE.MeshBasicMaterial({
     map: textureLoader.load('/webstorm.png'),
 });
 const mesh = new THREE.Mesh(geometry, material);
 //创建物体
 
 //const mesh =  new THREE.Mesh(geometry,marterial)
 
 //创建场景
 
 
 //将物体添加到场景中
//    scene.add(mesh)
 
 loader.load( '/gltf/shan.gltf', function ( gltf ) {

const mesh = gltf.scene.children[0];
    const pos = mesh.geometry.attributes.position;
    const count = pos.count;

    // 1. 计算模型y坐标高度差
    const yArr = [];//顶点所有y坐标，也就是地形高度
    for (let i = 0; i < count; i++) {
        yArr.push(pos.getY(i));//获取顶点y坐标，也就是地形高度
    }
    yArr.sort();//数组元素排序，从小到大
    const miny = yArr[0];//y最小值
    const maxy = yArr[yArr.length - 1];//y最大值
    const height = maxy - miny; //山脉整体高度 
// 2. 计算每个顶点的颜色值
const colorsArr = [];
const c1 = new THREE.Color(0x0000ff);//山谷颜色
const c2 = new THREE.Color(0xff0000);//山顶颜色
for (let i = 0; i < count; i++) {
    //当前高度和整体高度比值
    const percent = (pos.getY(i) - miny) / height;
    const c = c1.clone().lerp(c2, percent);//颜色插值计算
    colorsArr.push(c.r, c.g, c.b); 
}
const colors = new Float32Array(colorsArr);
// 设置几何体attributes属性的颜色color属性
mesh.geometry.attributes.color = new THREE.BufferAttribute(colors, 3);
mesh.material = new THREE.MeshLambertMaterial({
    vertexColors:true,
});
// 返回的场景对象gltf.scene插入到threejs场景中
scene.add( gltf.scene );
})
 
 //创建相机
   const camera =  new THREE.PerspectiveCamera(75,thress.value.clientWidth/thress.value.clientHeight,0.1,1000)
 
 //设置相机位置
 camera.position.z = 5;
 



var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);
 
 var renderer = new THREE.WebGLRenderer();
   renderer.setSize(thress.value.clientWidth, thress.value.clientHeight)
   thress.value.appendChild(renderer.domElement)
   renderer.render(scene, camera)
 
   const controls = new OrbitControls(camera, renderer.domElement)
   controls.enableDamping = true
     controls.target.set(0, 0, 0)
     controls.update()
     const animate = () => {
       requestAnimationFrame(animate)
       mesh.rotation.x += 0.01;
       mesh.rotation.y += 0.01;
       controls.update()
       renderer.render(scene, camera)
     }
     animate()
 }
 
 onMounted(()=>{
   init()
 })
 
 
 </script>
 <style scoped lang="less">
 .three-dom {
   width: 100%;
   height: 100%;
 }
 </style>