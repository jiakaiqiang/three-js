import h337 from '@rengr/heatmap.js'
import * as THREE from "three";
export default function addHeatmapPlane(scene) {
  let x = 230
  let y = 60
  const canvasBox = document.createElement('div')
  document.body.appendChild(canvasBox)

  canvasBox.style.width = x + 'px'
  canvasBox.style.height = y + 'px'
  canvasBox.style.position = 'absolute'

  let canvas = h337.create({
    container: canvasBox,
    radius: 4,
    maxOpacity: 0.8,
    minOpacity: 0
  })
  canvas.setData({
    max: 20,
    min: 0,
    data: [
      { x:99, y: 12, value: 2 },
      { x: 100, y: 13.5, value: 6 },
      { x: 98, y: 14.0, value: 4 },
      { x: 109, y: 15.5, value: 2 },
      { x: 110, y: 12.0, value: 3 },
      { x: 107, y: 12.0, value: 33 },
      
      
    ]
  })
  const g = new THREE.PlaneGeometry(x, y)
  const m = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(canvas._renderer.canvas),
    transparent: true,
    side: THREE.DoubleSide
  })
 const  heatmapPlane = new THREE.Mesh(g, m)
  heatmapPlane.rotateX(Math.PI / 2)
  heatmapPlane.position.set(10, 0.1, -18)
  scene.add(heatmapPlane)
  document.body.removeChild(canvasBox)
}
