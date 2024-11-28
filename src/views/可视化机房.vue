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
import {ref, onMounted, reactive} from "vue";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import addHeatmapPlane from "../components/roomData/yuntu";
import {PathGeometry, PathPointList} from "three.path";
import * as TWEEN from '@tweenjs/tween.js'

const thress = ref(null);
const scene = new THREE.Scene();
let camera
let pathCurve;
let cameraTween = null;
let cubPerson
let jkqSelectObect = {};
let eyesValue = ref(false)
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


function init() {
  var renderer = new THREE.WebGLRenderer();
  initPathPoints();
  renderPath(renderer);

  //创建机器人
  const geoPerson = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const matPeron = new THREE.MeshBasicMaterial({color: 0x00ff00});
  cubPerson = new THREE.Mesh(geoPerson, matPeron);
  cubPerson.position.set(2, 1, -5.5);


  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
      "models/machineRoom.gltf",
      function (gltf) {
        gltf.scene.children.forEach(item => {
          const {map, color} = item.material;
          if (map) {
            item.material = new THREE.MeshBasicMaterial({
              map: crtTexture(item.name.split("-")[0])
            });
          } else {
            item.material = new THREE.MeshBasicMaterial({color});
          }
        });

        scene.add(gltf.scene);
        scene.add(pathToShow); // 确保路径贴图被添加到场景中
      },
      num => {
      },
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
  cubPerson.add(camera)
  scene.add(cubPerson);

  //创建十字坐标
  scene.add(new THREE.AxesHelper(5))

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
  let step = 0;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    camera.updateProjectionMatrix();
    if (renderFunc['walk-way']) {
      renderFunc['walk-way']();
    }
    if (cameraTween) {

      const segment = 1000;
// 从路径曲线上面取点
      const stepPoints = pathCurve.getSpacedPoints(segment);

// 每次前进一小段
      step += 1;

// NPC下个位置的索引
      const npcIndex = step % segment;

// NPC下一个位置
      const npcPoint = stepPoints[npcIndex];

// 更新NPC模型的位置
      cubPerson.position.copy(npcPoint);

// NPC眼睛看向的点的索引
      const eyeIndex = (step + 10) % segment;

// NPC眼睛看向的位置
      const eyePoint = stepPoints[eyeIndex];

      if (eyesValue.value) {

        if (points[points.length - 1].x == eyePoint.x && points[points.length - 1].z == eyePoint.z) {
          cameraTween = false
        }
        cubPerson.lookAt(eyePoint.x, eyePoint.y, npcPoint.z);


        camera.lookAt(cubPerson.position.x, 1, cubPerson.position.z);
      }


// 更新NPC模型看向的位置，保证模型的“朝向”


      //TWEEN.update();
    }


  }

  animate();

  renderer.domElement.addEventListener("click", event => {
    console.log(jkqSelectObect, 'jkqSelectObect')
    if (Object.keys(jkqSelectObect).length > 0) {
      jkqSelectObect.material.map = crtTexture("cabinet");
      // camera.position.set(jkqSelectObect.position.x+1,3,jkqSelectObect.position.z)
      // camera.lookAt(jkqSelectObect.position.x,3,jkqSelectObect.position.z)
      //  controls.target.copy(jkqSelectObect.position.x,3,jkqSelectObect.position.z)
      // controls.update()
    } else {
      jkqSelectObect.material.map = crtTexture("cabinet-hover");
    }
  });

  renderer.domElement.addEventListener("mousemove", event => {
    const px = event.offsetX;
    const py = event.offsetY;
    const x = (px / thress.value.clientWidth) * 2 - 1;
    const y = -(py / thress.value.clientHeight) * 2 + 1;

    // raycaster.ray.origin = new THREE.Vector3(0, 100, 0);
    // raycaster.ray.direction = new THREE.Vector3(0, -1, 0);
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

          jkqSelectObect.material.map = crtTexture("cabinet");
          document.body.style.cursor = "default";
        } else {
          document.body.style.cursor = "pointer";
          selectObject.material.map = crtTexture("cabinet-hover");
        }

        jkqSelectObect = selectObject;
      } else {
        state.planeDisplay = 'none';
      }
    } else {
      outlinePass.selectedObjects = [];
    }
  });


  addHeatmapPlane(scene);
}

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
};


const changeEyes = () => {
  eyesValue.value = !eyesValue.value
  if (!eyesValue.value) {
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 20, 4)
    scene.add(camera)
    controls.enabled = true
    controls.update()

  } else {
    camera.position.set(0, 1, -1);
    cubPerson.add(camera)
    controls.enabled = false
  }

}

const handleAuto = () => {
  eyesValue.value = true
  cameraTween = true
  controls.enabled = false
  camera.position.set(0, 1, -1);
  cubPerson.add(camera)


// const segment = 30000;

// // // 取相机当前位置，从当前位置，平滑移动到目标位置
//  const curCameraPosition = camera.position.clone();
// const position = new THREE.Vector3(9, 0, 2);
// //获取相机的视图
// const duration =12000
// // 创建补间动画TWEEN对象
// cameraTween = new TWEEN.Tween(curCameraPosition).to(position, duration).easing(TWEEN.Easing.Quadratic.Out);

// // 设定更新过程中执行的动作
// cameraTween.onUpdate((obj) => {


//   // 持续duration毫秒的移动过程中， obj为“此时”坐标移动到的位置，通过不断地将相机的位置设定到坐标“此时”变化到的位置，来形成一个平滑的移动效果。
//   camera.position.set(obj.x, obj.y, obj.z);
//   camera.lookAt(obj.x, obj.y, obj.z);

//   // 如果指定了onUpdate方法，再执行下指定的onUpdate
//   onUpdate && onUpdate(obj);
// });

// // 设定完成后执行的动作
// cameraTween.onComplete(() => {
//   callback && callback();
// });


}

onMounted(() => {
  init();
});

function selectCabinet(x, y) {
  const {width, height} = thress.value;
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
