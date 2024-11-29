<template>
  <div style="height:100%;width:100%">
    <div ref="thress" class="three-dom" @click="handleClick">
      <div
          id="plane"
          :style="{left: state.planePos.left,top:state.planePos.top,display: state.planeDisplay}"
      >
        <p>机柜名称：{{ state.curCabinet.name }}</p>
        <p>机柜温度：{{ state.curCabinet.temperature }}°</p>
        <p>使用情况：{{ state.curCabinet.count }} / {{ state.curCabinet.capacity }}</p>
      </div>
    </div>
    <el-button @click="handleAuto" style="position: absolute; top: 10px; left: 10px">自动巡检</el-button>
    <el-button @click="changeEyes" style="position: absolute; top: 10px; left:100px">切换视角</el-button>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import addHeatmapPlane from "../components/roomData/yuntu";
import * as TWEEN from '@tweenjs/tween.js';
import {PathGeometry, PathPointList} from "three.path";
const thress = ref(null);
const scene = new THREE.Scene();
let camera;
let pathCurve;
let cameraTween = null;
let cubPerson;
let tween
let jkqSelectObect = {
  material: {}
};
let eyesValue = ref(false);
let controls;
const state = reactive({
  planePos: {
    left: 0,
    top: 0
  },
  planeDisplay: "none",
  curCabinet: {
    name: "Loading……",
    temperature: 0,
    capacity: 0,
    count: 0
  }
});

let arrow = '';
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let maps = new Map();
let pathToShow;
let points;
let pointArr;
let renderFunc = {};

const registerRenderFunc = (name, func) => {
  renderFunc[name] = func;
};

const initPathPoints = () => {
  pointArr = [
    2, 0, -5.5,
    -9, 0, -5.5,
    -9, 0, -3,
    9, 0, -3,
    9, 0, 2,
    -5, 0, 2,
    // 其他坐标点...
  ];

  points = [];
  for (let i = 0; i < pointArr.length; i += 3) {
    points.push(new THREE.Vector3(pointArr[i], pointArr[i + 1], pointArr[i + 2]));
  }

  pathCurve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0);
};

const createSquare = () => {
  const geoPerson = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const matPeron = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cubPerson = new THREE.Mesh(geoPerson, matPeron);
  cubPerson.position.set(2, 0.5, -5.5);
  scene.add(cubPerson);
};

const moveSquareAlongPath = (points, duration, stopPoints) => {
  const totalLength = pathCurve.getLength();
  const step = totalLength / points.length;

  let currentPointIndex = 0;
  let currentLength = 0;

   tween = new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, duration)
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate(({ t }) => {
      console.log(t,'sdsdsd')
      const length = t * totalLength;
      const point = pathCurve.getPointAt(t);

      cubPerson.position.copy(point);
      // 更新相机位置和方向
      camera.position.set(point.x, point.y + 1, point.z); // 相机高度稍微高一点
      camera.lookAt(point);

      // 获取前一个点的索引
      const previousPointIndex = Math.max(0, currentPointIndex - 2);
      const previousPoint = points[previousPointIndex];

      // 计算物体的朝向
      const direction = new THREE.Vector3();
      direction.subVectors(point, previousPoint).normalize();

      // 设置相机的方向
      camera.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(camera.position, camera.position.clone().add(direction), new THREE.Vector3(0, 1, 0)));


      currentLength += step;
      currentPointIndex = Math.floor(currentLength / step);
    })
    .onComplete(() => {
      console.log("路径结束");
    })
    .start();
};

const handleAuto = () => {
  eyesValue.value = true;
  controls.enabled = false;
  camera.position.set(0, 1, -5);
  cubPerson.add(camera);

  const stopPoints = [-9, 0, -5.5,]; // 指定停止点的索引
  const points = pathCurve.getPoints(1000);
  const duration = 12000; // 总时间

  moveSquareAlongPath(points, duration, stopPoints);
};

const changeEyes = () => {
  eyesValue.value = !eyesValue.value;
  if (!eyesValue.value) {
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 20, 4);
    scene.add(camera);
    controls.enabled = true;
    controls.update();
  } else {
    camera.position.set(0, 1, -1);
    cubPerson.add(camera);
    controls.enabled = false;
  }
};

const init = () => {
  var renderer = new THREE.WebGLRenderer();
  initPathPoints();
  createSquare();
  renderPath(renderer);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "models/machineRoom.gltf",
    function (gltf) {
      gltf.scene.children.forEach(item => {
        const { map, color } = item.material;
        if (map) {
          item.material = new THREE.MeshBasicMaterial({
            map: crtTexture(item.name.split("-")[0]),
            side: THREE.FrontSide // 设置模型只能查看正面
          });
        } else {
          item.material = new THREE.MeshBasicMaterial({ color, side: THREE.FrontSide });
        }
      });

      scene.add(gltf.scene);
      scene.add(pathToShow); // 确保路径贴图被添加到场景中
    },
    num => {},
    err => {
      console.log(err, "----wfef");
    }
  );

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

  camera = new THREE.PerspectiveCamera(
    75,
    thress.value.clientWidth / thress.value.clientHeight,
    0.1,
    1000
  );

  camera.position.set(15, 15, 15);
  camera.lookAt(0, 0, 0);
  cubPerson.add(camera);
  scene.add(cubPerson);

  // 创建十字坐标
  scene.add(new THREE.AxesHelper(5));

  const outlinePass = new OutlinePass(
    new THREE.Vector2(thress.value.clientWidth, thress.value.clientHeight),
    scene,
    camera
  );

  renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
  thress.value.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  composer.addPass(outlinePass);

  controls = new OrbitControls(camera, renderer.domElement);

  controls.addEventListener("change", function () {
    renderer.render(scene, camera);
  });

  function animate() {
    requestAnimationFrame(animate);

    tween&&tween.update(); // 更新 TWEEN 动画

    renderer.render(scene, camera);
    camera.updateProjectionMatrix();
  }

  animate();



  renderer.domElement.addEventListener("click", event => {
    const px = event.offsetX;
    const py = event.offsetY;
    const x = (px / thress.value.clientWidth) * 2 - 1;
    const y = -(py / thress.value.clientHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects(scene.children);

    state.planePos.left = px + "px";
    state.planePos.top = py + "px";

    if (intersects.length > 0) {
      if (intersects[0].object.name.split("-")[0] === "cabinet") {
        const selectObject = intersects[0].object;
        outlinePass.selectedObjects = [selectObject];

        if (Object.keys(jkqSelectObect).length > 0 && jkqSelectObect?.name != selectObject.name) {


          camera.position.set(jkqSelectObect.position.x+1,3,jkqSelectObect.position.z)
          camera.lookAt(jkqSelectObect.position.x,3,jkqSelectObect.position.z)
           controls.target.copy(jkqSelectObect.position.x,3,jkqSelectObect.position.z)
          controls.update()
          jkqSelectObect.material.map = crtTexture("cabinet");
          document.body.style.cursor = "default";
        } else {
          document.body.style.cursor = "pointer";
          selectObject.material.map = crtTexture("cabinet-hover");
        }

        jkqSelectObect = selectObject;
      } else {

        jkqSelectObect={}
      }
    } else {
      outlinePass.selectedObjects = [];
      jkqSelectObect={}
    }
  });
  renderer.domElement.addEventListener("mousemove", event => {
    const px = event.offsetX;
    const py = event.offsetY;
    const x = (px / thress.value.clientWidth) * 2 - 1;
    const y = -(py / thress.value.clientHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects(scene.children);

    state.planePos.left = px + "px";
    state.planePos.top = py + "px";

    if (intersects.length > 0) {
      if (intersects[0].object.name.split("-")[0] === "cabinet") {
        const selectObject = intersects[0].object;
        outlinePass.selectedObjects = [selectObject];

        if (Object.keys(jkqSelectObect).length > 0 && jkqSelectObect?.name != selectObject.name) {
          state.planeDisplay = "block";
          state.curCabinet = {
            name: `测试机柜001`,
            temperature: 12,
            capacity: 20,
            count: 5


          };


          document.body.style.cursor = "default";
        } else {
          document.body.style.cursor = "pointer";

        }

        jkqSelectObect = selectObject;
      } else {
        state.planeDisplay = 'none';
        jkqSelectObect={}
      }
    } else {
      outlinePass.selectedObjects = [];
      jkqSelectObect={}
    }
  });
  renderer.domElement.addEventListener('mouseout',event=>{
    jkqSelectObect = {}
  })
  addHeatmapPlane(scene);
};

const renderPath = async (renderer) => {
  arrow = await new THREE.TextureLoader().loadAsync(require("@/assets/arrow.png"));
  arrow.wrapS = THREE.RepeatWrapping;
  arrow.anisotropy = renderer.capabilities.getMaxAnisotropy();

  registerRenderFunc('walk-way', () => {
    arrow.offset.x -= 0.02;
  });

  const material = new THREE.MeshBasicMaterial({
    map: arrow,
    blending: THREE.CustomBlending,
  });

  const up = new THREE.Vector3(0, 1, 0);

  let pathPoints = new PathPointList();
  pathPoints.set(pathCurve.getPoints(1000), 0.5, 1, up, false);

  const geometry = new PathGeometry();
  geometry.update(pathPoints, {
    width: 0.2,
    arrow: false,
  });

  pathToShow = new THREE.Mesh(geometry, material);
  pathToShow.position.y = 0.2;
  pathToShow.name = "path";
  scene.add(pathToShow);
};

const selectCabinet = (x, y) => {
  const { width, height } = thress.value;
  pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
};

const handleClick = (e) => {
  console.log(e);
};

onMounted(() => {
  init();
});
</script>

<style scoped lang="less">
.three-dom {
  width: 100%;
  height: 100%;
}

#plane {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 0 18px;
  transform: translate(12px, -100%);
  display: none;
}
</style>
