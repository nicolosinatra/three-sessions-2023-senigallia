// Rotating cube

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let renderer
let geometry
let material
let animation
let onWindowResize

export function sketch(canvas3D, THREE) {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    canvas3D.appendChild(renderer.domElement)

    // CAMERA
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // SCENE
    const scene = new THREE.Scene()
    geometry = new THREE.BoxGeometry(2, 2, 2)
    material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION
        cube.rotation.x += 0.04
        cube.rotation.y += 0.01
        // ...

        renderer.render(scene, camera) // RENDER
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    renderer.dispose()
    geometry.dispose()
    material.dispose()
    window.removeEventListener('resize', onWindowResize)
}