<template>
  <div ref="thress" class="three-dom" @click="handleClick"></div>
</template>
    

<script setup>
import { ref, onMounted, reactive } from "vue";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const thress = ref(null);
const scene = new THREE.Scene();
let jkqSelectObect = {};

//创建射线投射器
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let maps = new Map();

function init() {
  //加载模型

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "models/machineRoom.gltf",
    function(gltf) {
      gltf.scene.children.forEach(item => {
        const { map, color } = item.material;
        if (map) {
          item.material = new THREE.MeshBasicMaterial({
            map: crtTexture(item.name.split("-")[0])
          });
        } else {
          item.material = new THREE.MeshBasicMaterial({ color });
        }
      });

      scene.add(gltf.scene);
    },
    num => {},
    err => {
      console.log(err, "----wfef");
    }
  );
  // 建立纹理对象
  function crtTexture(imgName) {
    let curTexture = maps.get(imgName);
    if (!curTexture) {
      curTexture = new THREE.TextureLoader().load(`models/${imgName}.jpg`);

      curTexture.flipY = false;
      curTexture.wrapS = 0.5;
      curTexture.wrapT = 0.5;
      maps.set(imgName, curTexture);
    }
    return curTexture;
  }

  //创建相机
  const camera = new THREE.PerspectiveCamera(
    30,
    thress.value.clientWidth / thress.value.clientHeight,
    0.1,
    1000
  );

  //设置相机位置
  camera.position.set(30, 30, 30);
  camera.lookAt(0, 0, 0);
  const outlinePass = new OutlinePass(
    new THREE.Vector2(thress.value.clientWidth, thress.value.clientHeight),
    scene,
    camera
  );

  //创建渲染器
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
  thress.value.appendChild(renderer.domElement);
  renderer.render(scene, camera);
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // outlinePass.visibleEdgeColor.set(0xff0000); // 可见边缘颜色
  // outlinePass.hiddenEdgeColor.set(0xffffff); // 隐藏边缘颜色
  // outlinePass.edgeStrength = 5; // 边缘强度
  // outlinePass.edgeThickness = 1; // 边缘厚度
  composer.addPass(outlinePass);
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.target.set(0, 0, 0);
  controls.update();
  controls.addEventListener("change", function() {
    renderer.render(scene, camera); //执行渲染操作
  });
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    camera.updateProjectionMatrix();
  }
  animate();
  renderer.domElement.addEventListener('click',event=>{
    if (Object.keys(jkqSelectObect).length>0) {

      jkqSelectObect.material.map = crtTexture("cabinet");

    }else{

      jkqSelectObect.material.map = crtTexture("cabinet-hover");
    }

  })
  renderer.domElement.addEventListener("mousemove", event => {
    // left、top表示canvas画布布局，距离顶部和左侧的距离(px)
    const px = event.offsetX;
    const py = event.offsetY;
    //屏幕坐标px、py转标准设备坐标x、y
    //width、height表示canvas画布宽高度
    const x = (px / thress.value.clientWidth) * 2 - 1;
    const y = -(py / thress.value.clientHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin = new THREE.Vector3(0, 100, 0);
    // 设置射线方向射线方向沿着x轴
    raycaster.ray.direction = new THREE.Vector3(0, -1, 0);
    //.setFromCamera()计算射线投射器`Raycaster`的射线属性.ray
    // 形象点说就是在点击位置创建一条射线，射线穿过的模型代表选中
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    // 计算物体和射线的交点，选中多个物体时，point为交点数组
    const intersects = raycaster.intersectObjects(scene.children);




    if (intersects.length > 0) {
      if (intersects[0].object.name.split("-")[0] === "cabinet") {
        // 获取选中最近的物体
        const selectObject = intersects[0].object;
        // 设置选中物体边框
        outlinePass.selectedObjects = [selectObject];
       
        // 设置选中物体颜色
        if (Object.keys(jkqSelectObect).length>0 && jkqSelectObect?.name != selectObject.name) {
          jkqSelectObect.material.map = crtTexture("cabinet");
          document.body.style.cursor =  'default'
        }else{

          document.body.style.cursor='pointer'
          selectObject.material.map = crtTexture("cabinet-hover");
          }
      
         jkqSelectObect = selectObject;
      }
     
    } else {
      // 清空选中物体
      outlinePass.selectedObjects = [];
    }
  });
}

onMounted(() => {
  init();
});
// 选择机柜
function selectCabinet(x, y) {
  const { width, height } = thress.value;
  pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
}
function handleClick(e) {
  console.log(e);
}
</script>
<style scoped lang="less">
.three-dom {
  width: 100%;
  height: 100%;
}
</style>