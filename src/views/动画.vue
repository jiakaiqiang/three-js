<template>
  <div id="scene"></div>
</template>
<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as TWEEN from '@tweenjs/tween.js'
import { onMounted } from 'vue'

let scene,camera,renderer,controls,tween
onMounted(()=>{
  init()
})
function init() {
  initScene()
  initCamera()
  initAxesHelper()
  initLight()
  initRenderer()
  initControls()
  initMesh()
  animate()

  window.addEventListener('resize',onWindowResize.bind(this))
}
// 初始化场景
function initScene() {
  scene = new THREE.Scene()
}
// 初始化相机
function initCamera() {
  camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
  camera.position.set(0,2,2)
}
// 辅助轴
function initAxesHelper() {
  const axesHelper = new THREE.AxesHelper(1)
  scene.add(axesHelper)
}
// 灯光
function initLight() {
  const hesLight = new THREE.HemisphereLight(0xffffff,0x444444)
  hesLight.intensity = 0.3
  scene.add(hesLight)

  const dirLight = new THREE.DirectionalLight()
  dirLight.position.set(5,5,5)
  scene.add(dirLight)

  const pointLight = new THREE.PointLight(0xffffff,1.5)
  pointLight.position.set(0,100,90)
  scene.add(pointLight)
  pointLight.color.setHSL(Math.random(),1,0.5)
}
// 初始化渲染器
function initRenderer() {
  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth,window.innerHeight)
  document.querySelector('#scene').appendChild(renderer.domElement)
  renderer.shadowMap.enable = true
}
// 初始化轨道控制器
function initControls() {
  controls = new OrbitControls(camera,renderer.domElement)
  controls.minPolarAngle = 0
  controls.maxPolarAngle = 80 / 360 * 2 * Math.PI
  controls.update()
}
// Mesh
function initMesh() {
  const boxGeometry = new THREE.BoxGeometry(0.3,0.3,0.3)
  const boxMaterial = new THREE.MeshPhongMaterial({color:0x00ff00})
  const boxMesh = new THREE.Mesh(boxGeometry,boxMaterial)
  tween = new TWEEN.Tween(boxMesh.position)
  scene.add(boxMesh)
  tween.to({x:3,y:0,z:0},2000)
  tween.onUpdate(function(){
    camera.lookAt(0,0,0)
  })
  tween.start()

}
function animate() {

  renderer.render(scene,camera)
  controls.update()
  tween.update()
  requestAnimationFrame(animate)
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth,window.innerHeight)
}
</script>
<style scoped>
</style>