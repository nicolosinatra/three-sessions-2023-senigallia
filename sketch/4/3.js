// Load GLTF // XXX BONES
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let scene
let geometry, groundGeom
let material, material2, groundMate
let animation
let onWindowResize
let noise3D
let controls
let composer
let renderPass
let bloomPass
let loaderGLTF

export function sketch() {
    console.log("Sketch launched")

    const p = {
        // time
        timeSpeed: 0.0001,
        // planet
        planetScale: 3,
        planetScaleAuto: true,
        planetScaleMax: .25,
        planetPos: new THREE.Vector3(0, 3, 0),
        planetSpeed: 1,
        planetRotationSpeed: 0.005,
        // view
        lookAtCenter: new THREE.Vector3(0, 1, 0),
        cameraPosition: new THREE.Vector3(0, -4, -20),
        autoRotate: false,
        autoRotateSpeed: -2,
        camera: 35,
        // bloom
        exposure: 0.2,
        bloomStrength: 0,
        bloomThreshold: .25,
        bloomRadius: 1.2,
        //world
        floor: -5,
    }

    // other parameters
    let near = 0.2, far = 1000
    let shadowMapWidth = 2048, shadowMapHeight = 2048

    // CAMERA
    let camera = new THREE.PerspectiveCamera(p.camera, window.innerWidth / window.innerHeight, near, far)
    camera.position.copy(p.cameraPosition)
    camera.lookAt(p.lookAtCenter)

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 10
    controls.maxDistance = 25
    controls.maxPolarAngle = Math.PI / 2 + 0.2
    controls.minPolarAngle = Math.PI / 2 - 0.4
    controls.autoRotate = p.autoRotate
    controls.autoRotateSpeed = p.autoRotateSpeed
    controls.target = p.lookAtCenter

    // SCENE
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(scene.background, 5, 100)
    geometry = new THREE.ConeGeometry(1, 2, 64)

    // POST-PROCESSING
    composer = new EffectComposer(renderer)
    renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = p.bloomThreshold
    bloomPass.strength = p.bloomStrength
    bloomPass.radius = p.bloomRadius
    composer.addPass(bloomPass)

    // Planet cone
    // let planet
    material = new THREE.MeshStandardMaterial({
        color: 0xff99ff,
        // map: textures[0].texture,
        roughness: 0,
        metalness: 0
    })
    // planet = new THREE.Mesh(geometry, material)
    // planet.rotation.z += Math.PI
    // planet.position.y = 0
    // planet.position.x = 0
    // planet.scale.set(p.planetScale, p.planetScale, p.planetScale)
    // planet.castShadow = true
    // planet.receiveShadow = true
    // scene.add(planet)
    //GLTFLoader
    let gltfLoaded = false
    loaderGLTF = new GLTFLoader()
    loaderGLTF.load(
        // resource URL
        './assets/bones.gltf',
        // called when the resource is loaded
        function (gltf) {
            scene.add(gltf.scene)
            // gltf.animations // Array<THREE.AnimationClip>
            gltf.scene.scale.set(0.075, 0.075, 0.075)
            gltf.scene.position.x = -0.85
            gltf.scene.position.y = 3.35
            // gltf.scene // THREE.Group
            // gltf.scenes // Array<THREE.Group>
            // gltf.asset // Object
            // gltf.scene.children[0].material = material XXX
            gltfLoaded = true
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened')
        }
    )

    //Planet cone 2
    // let planet2
    // material2 = new THREE.MeshStandardMaterial({
    //     color: 0xbb8833,
    //     map: textures[0].texture,
    //     roughness: 0,
    //     metalness: 0
    // })
    // planet2 = new THREE.Mesh(geometry, material2)
    // // planet2.rotation.z += Math.PI
    // planet2.position.y = 0
    // planet2.position.x = 0
    // planet2.scale.set(p.planetScale, p.planetScale, p.planetScale)
    // planet2.castShadow = true
    // planet2.receiveShadow = true
    // scene.add(planet2)

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
    // const light2 = new THREE.DirectionalLight(0xffffff, .4)
    // light.position.set(-10, 3, 0)
    // light.target.position.set(-5, 0, 0)
    // light.castShadow = true
    // scene.add(light2)
    const pointLight = new THREE.PointLight(0xffffff, 2)
    pointLight.position.set(20, 20, 20)
    scene.add(pointLight)
    const pointLight2 = new THREE.PointLight(0xffffff, .1)
    pointLight2.position.set(-30, 20, -20)
    scene.add(pointLight2)
    // const ambientLight = new THREE.AmbientLight(0xffffff)
    // scene.add(ambientLight)

    // let's make a ground
    // groundGeom = new THREE.PlaneGeometry(20, 20)
    // groundMate = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1 })
    // let ground = new THREE.Mesh(groundGeom, groundMate)
    // ground.position.set(0, p.floor, 0)
    // ground.rotation.x = - Math.PI / 2
    // ground.scale.set(100, 100, 100)
    // ground.castShadow = false
    // ground.receiveShadow = true
    // scene.add(ground)

    // NOISE
    noise3D = NOISE.createNoise3D()
    const t0 = Math.random() * 10

    // ANIMATE
    const animate = () => {
        if (showStats) stats.begin() // XXX

        const t = t0 + performance.now() * p.timeSpeed

        // ANIMATION
        // if (planet) {
        //     const t1 = t * p.planetSpeed
        //     planet.position.x = p.planetPos.x + noise3D(0, t1, 0) * .5
        //     planet.position.y = p.planetPos.y + noise3D(t1 + 4, 0, 0) * 1.5
        //     planet.position.z = p.planetPos.z + noise3D(0, 0, t1 + 8) * .5
        //     planet.rotation.y += noise3D(0, 0, t + 10) * p.planetRotationSpeed
        //     if (p.planetScaleAuto) planet.scale.x = planet.scale.y = planet.scale.z = p.planetScale - (p.planetScaleMax / 2) + (noise3D(0, t1 + 12, 0) * p.planetScaleMax)
        // }

        if (gltfLoaded && scene.gltf) {
            //         // const t1 = t * p.planetSpeed
            gltf.scene.position.x = p.planetPos.x + noise3D(0, t1, 0) * .5
            gltf.scene.position.y = p.planetPos.y + noise3D(t1 + 4, 0, 0) * 1.5
            gltf.scene.position.z = p.planetPos.z + noise3D(0, 0, t1 + 8) * .5
            gltf.scene.rotation.y += noise3D(0, 0, t + 10) * p.planetRotationSpeed
            gltf.scene
            //         // if (p.planetScaleAuto) gltf.scene.scale.x = gltf.scene.scale.y = gltf.scene.scale.z = p.planetScale - (p.planetScaleMax / 2) + (noise3D(0, t1 + 12, 0) * p.planetScaleMax)
            // gltf.scene.rotation.y += noise3D(0, 0, t + 10) * p.planetRotationSpeed
        }

        // if (planet2) {
        //     const t1 = t * p.planetSpeed
        //     planet2.position.x = p.planetPos.x + noise3D(0, t1 + 14, 0) * .5
        //     planet2.position.y = p.planetPos.y + noise3D(t1 + 4, 0, 0) * 1.5 - 2 * p.planetScale
        //     planet2.position.z = p.planetPos.z + noise3D(0, 0, t1 + 18) * .5
        //     planet2.rotation.y += noise3D(0, 0, t + 10) * p.planetRotationSpeed
        //     if (p.planetScaleAuto) planet2.scale.x = planet2.scale.y = planet2.scale.z = p.planetScale - (p.planetScaleMax / 2) + (noise3D(0, t1 + 12, 0) * p.planetScaleMax)
        // }
        //...

        controls.update()
        renderer.render(scene, camera) // RENDER
        composer.render() // POST-PROCESSING
        if (showStats) stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    controls?.dispose()
    geometry?.dispose()
    groundGeom?.dispose()
    material?.dispose()
    material2?.dispose()
    groundMate?.dispose()
    noise3D = null
    composer?.dispose()
    renderPass?.dispose()
    bloomPass?.dispose()
    window.removeEventListener('resize', onWindowResize)
}