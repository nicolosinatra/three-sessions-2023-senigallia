// Planets + Noise
import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let renderer
let scene
let geometry
let material
let material2
let reflectionCube
let bumpMap
let diffMap
let animation
let onWindowResize
let noise3D

export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.shadowMap.enabled = true
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
    geometry = new THREE.SphereGeometry(1, 32, 32)
    // child
    let child
    const path = './assets/textures/cube/PureSky/'
    const format = '.png'
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ]
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    reflectionCube = cubeTextureLoader.load(urls, (cubeMap) => {
        material = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff, 
            envMap: reflectionCube, 
            reflectivity: 1.0,
            transmission: 1.0,
            roughness: 0.1, 
            metalness: 0.4,
            clearcoat: .3,
            ior: 1.40,
            thickness: 50,
        })
        child = new THREE.Mesh(geometry, material)
        child.position.x = 5
        child.castShadow = true
        child.receiveShadow = true
        scene.add(child)
    })
    // parent
    let parent
    const diffMapLoader = new THREE.TextureLoader()
    const bumpMapLoader = new THREE.TextureLoader()
    diffMap = diffMapLoader.load('/assets/textures/stone_tiles_02_diff_1k.jpg')
    bumpMap = bumpMapLoader.load('/assets/textures/stone_tiles_02_disp_4k.png', (bumpMap) => {
        material2 = new THREE.MeshStandardMaterial({ 
            color: 0x6c5c4c, 
            map: diffMap, 
            bumpMap: bumpMap, 
            bumpScale: 0.2, 
            roughness: 0.4, 
            metalness: 0.1
        })
        bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping
        bumpMap.repeat.set(4, 4)
        parent = new THREE.Mesh(geometry, material2)
        parent.position.x = -2
        parent.scale.set(3, 3, 3)
        parent.castShadow = true
        parent.receiveShadow = true
        scene.add(parent)
    })

    // material2 = new THREE.MeshStandardMaterial({ color: 0x6c5c4c, map: diffMap, bumpMap: bumpMap, bumpScale: .2, roughness: .5, metalness: .1 })




    // LIGHTS
    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(-10, 0, 0)
    light.castShadow = true
    scene.add(light)
    const pointLight = new THREE.PointLight(0xffffff, 2)
    pointLight.position.set(20, 20, 20)
    scene.add(pointLight)
    const pointLight2 = new THREE.PointLight(0xffffff, .1)
    pointLight2.position.set(-30, 20, -20)
    scene.add(pointLight2)
    // const ambientLight = new THREE.AmbientLight(0xffffff)
    // scene.add(ambientLight)

    // NOISE
    noise3D = NOISE.createNoise3D()
    const t0 = Math.random() * 10

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX
        
        const t = t0 + performance.now() * 0.0001

        // t+=0.0005
        // ANIMATION
        if (parent) {
            // parent.position.x = -2 + noise3D(0,t,0) * .2
            parent.position.y = noise3D(t,0,0) * .2
            // parent.position.z = noise3D(0,0,t) * .1
        }
        if (child) {
            child.position.x = 5 + noise3D(0,t+12,0) * .3
            child.position.y = noise3D(t+12,0,0) * 1
            child.position.z = noise3D(0,0,t+12) * .2
        }
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
    geometry?.dispose()
    material?.dispose()
    material2?.dispose()
    reflectionCube?.dispose()
    bumpMap?.dispose()
    diffMap?.dispose()
    noise3D = null
    window.removeEventListener('resize', onWindowResize)
}