<template>
  <div class="three-dom">
    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px">
      <div id="red" class="bu">红</div>
      <div id="green" class="bu" style="margin-left: 10px;">绿</div>
      <button type="button" name="button" @click="saveFile">下载</button>
      <iframe src='http://localhost:5173/#/components/Form/Form3' width=600 height=600></iframe>
    </div>
    <div ref="thress" style="height:100%;width:100%"></div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const thress = ref(null);
const scene = new THREE.Scene();
let renderer;
function init() {
  // let geometry = new THREE.BoxGeometry(100, 100, 100);

  const geometry = new THREE.PlaneGeometry(60, 60);

  //纹理贴图加载器TextureLoader
  const texLoader = new THREE.TextureLoader();

  const texture = texLoader.load("/left.png");

  const material = new THREE.MeshBasicMaterial({
    // 设置纹理贴图：Texture对象作为材质map属性的属性值
    map: texture, //map表示材质的颜色贴图属性
    transparent: true
  });

  //创建物体
  let mesh = new THREE.Mesh(geometry, material);
  mesh.rotateX(-Math.PI / 2);
  scene.add(mesh);
  mesh.position.y = 1;
  //设置网格
  const gridHelper = new THREE.GridHelper(300, 25, 0x004444, 0x004444);
  scene.add(gridHelper);

  // AxesHelper：辅助观察的坐标系
  const axesHelper = new THREE.AxesHelper(150);
  scene.add(axesHelper);

  //创建相机用于拍照
  let camera = new THREE.PerspectiveCamera(
    30,
    thress.value.clientWidth / thress.value.clientHeight,
    1,
    3000
  );
  camera.position.set(200, 200, 200);
  camera.lookAt(mesh.position); //指向mesh对应的位置
  //创建渲染器

  scene.add(camera);

  renderer = new THREE.WebGLRenderer({
    antialias: true, //想把canvas画布上内容下载到本地，需要设置为true
    preserveDrawingBuffer: true
  });
  renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
  renderer.render(scene, camera);

  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  renderer.domElement.style.zIndex = -1;
  //设置透明背景
  renderer.setClearAlpha(0.8);

  const controls = new OrbitControls(camera, renderer.domElement);
  // 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
  controls.addEventListener("change", function() {
    renderer.render(scene, camera); //执行渲染操作
  }); //监听鼠标、键盘事件
  thress.value.appendChild(renderer.domElement); //将渲染器添加到指定的元素中

  //模型随着窗口的变化而变化
  window.onresize = function() {
    renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
    camera.aspect = thress.value.clientWidth / thress.value.clientHeight;
    camera.updateProjectionMatrix();
  };

  //通过按钮和场景进行交互
  document.getElementById("red").addEventListener("click", function() {
    mesh.material.color.set(0xff0000);
  });
  document.getElementById("green").addEventListener("click", function() {
    mesh.material.color.set(0x00ff00);
  });

  function render() {
    renderer.render(scene, camera); //执行渲染操作
    mesh.rotateZ(0.01); //每次绕y轴旋转0.01弧度
    requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧
  }
  render();
}
// 将canvas画布上的内容保存到本地
const saveFile = () => {
  // 创建一个超链接元素，用来下载保存数据的文件
  //想把canvas画布上内容下载到本地，需要设置为true
  const link = document.createElement("a");
  // 通过超链接herf属性，设置要保存到文件中的数据

  // 通过超链接herf属性，设置要保存到文件中的数据
  const canvas = renderer.domElement; //获取canvas对象
  link.href = canvas.toDataURL("image/png"); //触发超链接元素a的鼠标点击事件，开始下载文件到本地
  link.download = "threejs.png"; //下载文件名
  link.click(); //js代码触发超链接元素a的鼠标点击事件，开始下载文件到本地
};

onMounted(() => {
  init();
});
</script>
<style scoped lang="less">
.bu {
  color: #fff;
  background-color: #000;
  border: none;
  margin: 10px;
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background-color: #333;
    color: #fff;
  }
}
.three-dom {
  width: 100%;
  height: 100vh;
}
</style>