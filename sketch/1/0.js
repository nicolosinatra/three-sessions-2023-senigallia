// Planets + Noise

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let renderer
let scene
let geometry
let material
let material2
let reflectionCube
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
    let camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 20

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)

    // SCENE
    scene = new THREE.Scene()
    // texture
    const path = './assets/textures/cube/PureSky/'
    const format = '.png'
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ]
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    reflectionCube = cubeTextureLoader.load(urls)
    const textureLoader = new THREE.TextureLoader()
    const bumpMap = textureLoader.load('/assets/textures/stone_tiles_02_disp_4k.png')
    const diffMap = textureLoader.load('/assets/textures/stone_tiles_02_diff_1k.jpg')
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping
    bumpMap.repeat.set(4, 4)
    material = new THREE.MeshStandardMaterial({ color: 0xffffff, envMap: reflectionCube, roughness: .1, metalness: 1 })
    material2 = new THREE.MeshStandardMaterial({ color: 0x6c5c4c, map: diffMap, bumpMap: bumpMap, bumpScale: .2, roughness: .5, metalness: .1 })
    geometry = new THREE.SphereGeometry()
    const child = new THREE.Mesh(geometry, material)
    child.position.x = 5
    scene.add(child)
    const parent = new THREE.Mesh(geometry, material2)
    parent.position.x = -5
    parent.scale.set(3, 3, 3)
    scene.add(parent)


    // LIGHTS
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0.5, 0.5, 1)
    scene.add(light)
    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.set(0, 0, 100)
    scene.add(pointLight)
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION
        // marching cubes

        // ...

        renderer.render(scene, camera) // RENDER
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    renderer?.dispose()
    material?.dispose()
    material2?.dispose()
    reflectionCube?.dispose()
    window.removeEventListener('resize', onWindowResize)
}