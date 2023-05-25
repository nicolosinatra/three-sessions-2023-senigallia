// Planets + Noise
import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { LoopSubdivision } from 'three-subdivide'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

let renderer
let scene
let geometry
let groundGeom
let material
let material2
let groundMate
let reflectionCube
let dispMap
let diffMap
let bumpMap
let animation
let onWindowResize
let noise3D

export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    let near = 10, far = 1000, floor = -5
    let shadowMapWidth = 2048, shadowMapHeight = 2048

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.shadowMap.enabled = true; // < Shadows enabled
    renderer.shadowMap.Type = THREE.PCFShadowMap // BasicShadowMap | PCFShadowMap | PCFSoftShadowMap | THREE.VSMShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    canvas3D.appendChild(renderer.domElement)

    // CAMERA
    let camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.2, far)
    camera.position.z = 20
    camera.position.y = -5
    camera.lookAt(new THREE.Vector3(0,2,0))

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 + 0.2
    controls.minPolarAngle = Math.PI / 2 - 0.4

    // SCENE
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(scene.background, 10, 100)
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
            metalness: 0.5,
            clearcoat: .3,
            ior: 1.40,
            thickness: 50,
        })
        child = new THREE.Mesh(geometry, material)
        child.position.x = 5
        child.position.y = 7
        child.castShadow = true
        child.receiveShadow = false
        scene.add(child)
    })
    // parent
    const iterations = 4
    const parentGeometry = LoopSubdivision.modify(geometry, iterations, {
        split: false,
        uvSmooth: false,
        preserveEdges: false,
        flatOnly: false,
        maxTriangles: 5000
    })
    mergeVertices(parentGeometry)
    let parent
    const diffMapLoader = new THREE.TextureLoader()
    const dispMapLoader = new THREE.TextureLoader()
    diffMap = diffMapLoader.load('/assets/textures/stone_tiles_02_diff_1k.jpg')
    bumpMap = diffMapLoader.load('/assets/textures/stone_tiles_02_disp_4k.png')
    dispMap = dispMapLoader.load('/assets/textures/stone_tiles_02_disp_4k.png', (dispMap) => {
        material2 = new THREE.MeshPhysicalMaterial({
            color: 0x9c9c9c,
            map: diffMap,
            displacementMap: dispMap,
            displacementScale: 0.2,
            // displacementBias: 0.01,
            bumpMap: dispMap,
            bumpScale: 0.3,
            roughness: .6,
            metalness: 0
        })
        dispMap.wrapS = dispMap.wrapT = THREE.RepeatWrapping
        dispMap.repeat.set(1, 1)
        parent = new THREE.Mesh(parentGeometry, material2)
        parent.position.x = -2
        parent.scale.set(3, 3, 3)
        parent.castShadow = true
        parent.receiveShadow = true
        scene.add(parent)
    })

    // LIGHTS
    let lightS = new THREE.SpotLight(0x999999, 1, 0, Math.PI / 5, 0.5)
    lightS.position.set(1, 50, 0)
    lightS.target.position.set(0, 0, 0)
    lightS.castShadow = true
    lightS.shadow.camera.near = 5
    lightS.shadow.camera.far = 200
    lightS.shadow.bias = 0.0001
    lightS.shadow.mapSize.width = shadowMapWidth
    lightS.shadow.mapSize.height = shadowMapHeight
    scene.add(lightS)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(-10, 3, 0)
    light.target.position.set(-5, 0, 0)
    // light.castShadow = true
    scene.add(light)
    const pointLight = new THREE.PointLight(0xffffff, 2)
    pointLight.position.set(20, 20, 20)
    scene.add(pointLight)
    const pointLight2 = new THREE.PointLight(0xffffff, .1)
    pointLight2.position.set(-30, 20, -20)
    scene.add(pointLight2)
    // const ambientLight = new THREE.AmbientLight(0xffffff)
    // scene.add(ambientLight)

    // let's make a ground
    groundGeom = new THREE.PlaneGeometry(20, 20)
    groundMate = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1 })
    let ground = new THREE.Mesh(groundGeom, groundMate)
    ground.position.set(0, floor, 0)
    ground.rotation.x = - Math.PI / 2
    ground.scale.set(100, 100, 100)
    ground.castShadow = false
    ground.receiveShadow = true
    scene.add(ground)

    // NOISE
    noise3D = NOISE.createNoise3D()
    const t0 = Math.random() * 10

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        const t = t0 + performance.now() * 0.0001

        // ANIMATION
        if (parent) {
            parent.position.x = -3 + noise3D(0, t, 0) * .2
            parent.position.y = 1 + noise3D(t + 4, 0, 0) * .3
            parent.position.z = noise3D(0, 0, t + 8) * .1
        }
        if (child) {
            child.position.x = 6 + noise3D(0, t + 12, 0) * .5
            child.position.y = 1 + noise3D(t + 24, 0, 0) * 1.5
            child.position.z = noise3D(0, 0, t + 35) * .4
        }
        // ...

        controls.update()
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
    groundGeom?.dispose()
    material?.dispose()
    material2?.dispose()
    groundMate?.dispose()
    reflectionCube?.dispose()
    dispMap?.dispose()
    diffMap?.dispose()
    bumpMap?.dispose()
    noise3D = null
    window.removeEventListener('resize', onWindowResize)
}