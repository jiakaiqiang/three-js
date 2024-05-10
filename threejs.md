**Three.js深入学习笔记（搭配案例）**

**一、Three.js的核心概念与组件**

**1. 场景（Scene）**

场景是Three.js中所有物体的容器，它负责管理和组织这些物体。创建场景非常简单：

```javascript
const scene = new THREE.Scene();
```

要将物体添加到场景中，使用`add`方法：

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);//定义物体
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });//材质（外形）
const cube = new THREE.Mesh(geometry, material);//通过物体和材质创建出立方体
scene.add(cube); //将立方体添加到场景中
```

**2. 相机（Camera）**

2.1 相机决定了观察者在场景中的视角和位置。常见的相机类型是透视相机，它模拟了人眼的视觉效果：

```javascript
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

这里，75是视野角度，`window.innerWidth / window.innerHeight`是宽高比，0.1和1000分别是近裁剪面和远裁剪面的距离。
```
2.2 相机控件 控制相机的旋转放大缩小等
```javascript
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;// 启用阻尼效果，让相机有惯性
controls.dampingFactor = 0.05;// 设置阻尼系数，让旋转更加真实
controls.screenSpacePanning = false; // 禁止平移
    controls.minDistance = 1; // 设置相机距离原点的最小值
    controls.maxDistance = 10; // 设置相机距离原点的最大值
    controls.minPolarAngle = 0; // 设置相机垂直旋转的最小角度
    controls.maxDistance = 10; // 设置相机垂直旋转的最大角度
    controls.maxPolarAngle = Math.PI / 2;// 设置相机水平旋转的最大角度
    如果我们设置了相机控件 同时改变了 camera.lookat 属性，那么 camera.lookat 
属性将失效。 则同时需要设置相机控件的lookAt 属性 即可实现 同时调用相机控件的update() 方法
```

**3. 渲染器（Renderer）**

渲染器负责将Three.js中的场景和相机渲染到HTML页面上：

```javascript
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

渲染循环中，使用`render`方法将场景渲染到页面：

```javascript
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
```

**4. 物体（Object）**

物体是Three.js中的基本单元，可以创建各种3D模型。例如，创建一个立方体网格：

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

**二、灯光与阴影**

**案例：添加点光源和阴影**

```javascript
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// 启用阴影
renderer.shadowMap.enabled = true;

// 为物体启用阴影
cube.castShadow = true;

// 为地面启用接收阴影
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x777777, receiveShadow: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 为相机启用阴影映射
camera.shadowMap.enabled = true;
camera.shadowMap.type = THREE.PCFSoftShadowMap;
```

**三、纹理与材质**

**案例：为物体添加纹理**

```javascript
const textureLoader = new THREE.TextureLoader();
textureLoader.load('path/to/texture.jpg', function(texture) {
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const texturedCube = new THREE.Mesh(geometry, material);
    scene.add(texturedCube);
});
```

**四、动画与交互进阶**

**案例：使用`Tween.js`实现平滑动画**

`Tween.js`是一个独立的动画库，它可以和Three.js完美结合，实现各种复杂的动画效果。

首先，引入`Tween.js`库：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.min.js"></script>
```

然后，在动画循环中使用`Tween.js`：

```javascript
const initialPosition = { x: 0, y: 0, z: 0 };
const targetPosition = { x: 5, y: 3, z: 2 };

const tween = new TWEEN.Tween(initialPosition)
    .to(targetPosition, 2000) // 2秒内到达目标位置
    .easing(TWEEN.Easing.Quadratic.InOut) // 使用缓动函数
    .onUpdate(() => {
        cube.position.copy(initialPosition); // 更新立方体的位置
    })
    .onComplete(() => {
        console.log('动画完成');
    })
    .start();

function animate() {
    requestAnimationFrame(animate);
    
    TWEEN.update(); // 更新所有Tween
    
    renderer.render(scene, camera);
}
animate();
```

**案例：使用射线拾取物体**

射线拾取（Raycasting）是一种常见的物体选择方法，用户可以通过点击屏幕来选择场景中的物体。

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        console.log('选中了物体:', selectedObject);
        // 可以在这里添加对选中物体的处理逻辑
    } else {
        console.log('没有选中任何物体');
    }
}
```

**五、性能优化**

**案例：减少绘制的物体数量**

当场景中物体数量巨大时，渲染性能会下降。可以通过减少绘制的物体数量来优化性能。

例如，可以使用`THREE.LOD`（Levels of Detail）技术，在不同距离下使用不同精细度的模型。

```javascript
const highDetailGeometry = new THREE.BoxGeometry(1, 1, 1);
const lowDetailGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2); // 更少的顶点

const highDetailMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const lowDetailMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

const lod = new THREE.LOD();

lod.addLevel(highDetailGeometry, highDetailMaterial);
lod.addLevel(lowDetailGeometry, lowDetailMaterial);

scene.add(lod);
```

**案例：使用GPUInstancing渲染大量相同物体**

当需要渲染大量相同的物体时，可以使用GPUInstancing技术。它允许一次性渲染多个相同的物体，从而大大提高性能。

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const instanceCount = 1000; // 假设要渲染1000个立方体

const instancesGeometry = new THREE.InstancedBufferGeometry();
instancesGeometry.copy(geometry);

const positions = new Float32Array(instanceCount * 3);
const scales = new Float32Array(instanceCount * 3);

for (let i = 0; i < instanceCount; i++) {
    positions[i * 3] = Math.random() * 100 - 50;
    positions[i * 3 + 1] = Math.random() * 100 - 50;
    positions[i * 3 + 2] = Math.random() * 100 - 50;
    scales[i * 3] = Math.random() * 0.5 + 0.5; // 随机缩放
    scales[i * 3 + 1] = Math.random() * 0.5 + 0.5;
    scales[i * 3 + 2] = Math.random() * 0.5 + 0.5;
}

instancesGeometry.setAttribute('position', new THREE.InstancedBufferAttribute(positions, 3));
instancesGeometry.setAttribute('scale', new THREE.InstancedBufferAttribute(scales, 3));

const mesh = new THREE.Mesh(instancesGeometry, material);
scene.add(mesh);
```

**七、高级特性**

**案例：实现阴影效果**

Three.js支持物体之间的阴影效果。首先，需要设置渲染器支持阴影：

```javascript
renderer.shadowMap.enabled = true;
```

然后，为光源和物体设置阴影属性：

```javascript
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
light.castShadow = true; // 光源投射阴影

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x777777 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true; // 接收阴影
scene.add(plane);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true; // 物体投射阴影
cube.position.set(0, 1, 0);
scene.add(cube);
```

**案例：使用后期处理效果**

后期处理（Post-processing）可以为场景添加各种视觉效果，如光晕、深度场等。Three.js可以配合`three-effect-composer`等库来实现这些效果。

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new BloomPass(0.8, 0.7, 0.1)); // 添加光晕效果

function animate() {
    requestAnimationFrame(animate);
    composer.render(); // 使用EffectComposer进行渲染
}
animate();
```

**八、总结与展望**

Three.js是一个非常强大的WebGL库，它允许开发者创建出令人惊叹的三维图形和动画。通过不断学习和实践，你可以掌握更多高级特性和优化技术，打造出更加出色的三维场景。

在未来，随着WebXR等技术的发展，Web三维图形将拥有更加广阔的应用前景。希望你可以通过Three.js的学习和实践，为这一领域的发展做出贡献。