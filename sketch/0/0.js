// Rotating cube + Post processing Glitch

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js'

let renderer
let geometry
let material
let composer
let renderPass
let glitchPass
let animation
let onWindowResize

export function sketch() {
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
    onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);

    // SCENE
    const scene = new THREE.Scene()
    geometry = new THREE.BoxGeometry(1, 1, 1)
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    let cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // POST-PROCESSING
    composer = new EffectComposer(renderer)
    renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)
    glitchPass = new GlitchPass()
    composer.addPass(glitchPass)

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
        // ...

        renderer.render(scene, camera) // RENDER
        composer.render() // POST-PROCESSING
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    renderer.dispose()
    composer.dispose()
    geometry.dispose()
    material.dispose()
    window.removeEventListener('resize', onWindowResize)
}