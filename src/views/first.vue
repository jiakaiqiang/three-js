<template>
 <div ref="thress" class="three-dom"></div>
</template>
    

<script setup>
import {ref,onMounted} from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const thress =  ref(null)
const scene =  new THREE.Scene();

function init(){
    //创建物体形状
 const geometry =  new THREE.BoxGeometry(40,40,40)

// //创建材质
// const  marterial =  new THREE.MeshBasicMaterial({color:"red"})
//const geometry = new THREE.PlaneGeometry(60, 60);
const textureLoader = new THREE.TextureLoader();
let textp = textureLoader.load('/webstorm.png')
const material = new THREE.MeshBasicMaterial({
    color:'red'
});

const mesh = new THREE.Mesh(geometry, material);
//创建物体

//const mesh =  new THREE.Mesh(geometry,marterial)

//创建场景


//将物体添加到场景中
scene.add(mesh)



//创建相机
  const camera =  new THREE.PerspectiveCamera(30,thress.value.clientWidth/thress.value.clientHeight,0.1,1000)

//设置相机位置
camera.position.set(100,100,100);
camera.lookAt(mesh.position)

 // 光线

var renderer = new THREE.WebGLRenderer();
  renderer.setSize(thress.value.clientWidth, thress.value.clientHeight)
  thress.value.appendChild(renderer.domElement)
  renderer.render(scene, camera)

  const controls = new OrbitControls(camera, renderer.domElement)
 
    controls.target.set(0, 0, 0)
    controls.update()
    controls.addEventListener('change', function () {
    renderer.render(scene, camera); //执行渲染操作
});
    // const animate = () => {
    //   requestAnimationFrame(animate)
    //   mesh.rotation.x += 0.01;
    //   mesh.rotation.y += 0.01;
    //   controls.update()
    //   renderer.render(scene, camera)
    // }
    // animate()
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