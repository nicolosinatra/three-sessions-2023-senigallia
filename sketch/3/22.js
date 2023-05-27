// Marching cubes


import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { PerspectiveCamera } from 'three';

let scene
let material
let effect
let reflectionCube
let animation
let onWindowResize
let noise3D
let controls
let gui

let effectController // per GUI



export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    const c = {
        // clouds 
        
        // view
        lookAtCenter: new THREE.Vector3(0, 1, 0),
        cameraPosition: new THREE.Vector3(0, -10, 50),
        autoRotate: true,
        autoRotateSpeed: -1,
        camera: 35,
        near: 0.1,
        far: 1000,
        // world
        floor: -5
    }

    let time = 0
    const clock = new THREE.Clock()
    
    // CAMERA
    let camera = new THREE.PerspectiveCamera(c.camera, window.innerWidth / window.innerHeight, c.near, c.far)
    camera.position.copy(c.cameraPosition)
    camera.lookAt(c.lookAtCenter)

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement)
    // controls.minDistance = 30;
	// controls.maxDistance = 30;

    // GUI
    gui = new GUI.GUI()
    setupGui()

    function setupGui() {
        // effect
        effectController = {
            s: 0.4 + Math.random(),
            sx: 0,
            sy: 0.5,
            sz: 0.5,
            speed: 0.02,
            numBlobs: 40 + Math.random() * 50, 
            resolution: 90, 
            isolation: 120, 
            floor: false,
            wallx: false,
            wallz: false,
            //dummy: function () { }
        }
 
        // simulation
        const simulationFolder = gui.addFolder( 'Simulation' );

        simulationFolder.add( effectController, 's', -2, 2, 0.05)
        simulationFolder.add( effectController, 'sx', 0, 1, 0.05)
        simulationFolder.add( effectController, 'sy', 0, 1, 0.05)
        simulationFolder.add( effectController, 'sz', 0, 1, 0.05)
        simulationFolder.add( effectController, 'speed', 0.01, 2, 0.01 )
        simulationFolder.add( effectController, 'numBlobs', 1, 100, 1 )
        simulationFolder.add( effectController, 'resolution', 14, 100, 1 )
        simulationFolder.add( effectController, 'isolation', 10, 300, 1 )
        simulationFolder.add( effectController, 'floor' )
        simulationFolder.add( effectController, 'wallx' )
        simulationFolder.add( effectController, 'wallz' )
        simulationFolder.open()

        // camera
        const cameraFolder = gui.addFolder( 'Camera' )
        cameraFolder.add( camera.position , 'x', -500, 500, 0.05 )
        cameraFolder.add( camera.position , 'y', -500, 500, 0.05 )
        cameraFolder.add( camera.position , 'z', 20, 150, 0.05 )
        cameraFolder.open()
    }
    
    // SCENE
    scene = new THREE.Scene()

    // TEXTURE
    material = new THREE.MeshStandardMaterial({ color: 0xffffff, envMap: global.cubeTextures[2].texture, roughness: 1, metalness: 1 })
    // material = new THREE.MeshStandardMaterial({ color: 0xaaaaff, envMap: reflectionCube, roughness: 0, metalness: 1, wireframe: true }) // versione wireframe

    let resolution = 32; 

    effect = new MarchingCubes(resolution, material, true, true, 100000) // 100000 numero massimo di poly
    effect.position.set(0, 0, 0)
    effect.scale.set(50, 50, 50)
    effect.enableUvs = false
    effect.enableColors = false
    scene.add(effect)
    
    // this controls content of marching cubes voxel field
    function updateCubes(object, time, numblobs, s, floor, wallx, wallz) {
        object.reset()
        // fill the field with some metaballs
        const subtract = 12 // a cosa serve?
        const strength = s / ((Math.sqrt(numblobs) - 1) / 4 + 1) // dimensione delle sfere (dipende da quanti blob ci sono in scena)
        // const column = row /2

        for (let i = 0; i < numblobs; i++) {
            const ballx = 0.5 + (Math.sin(i * time * (Math.cos(i)))) * 0.2
            const bally = 0.5 + (Math.abs(Math.cos(i * time * Math.cos(i)))) * 0.1 // dip into the floor
            const ballz = 0.5 + (Math.cos(i * time * Math.sin((i)))) * 0.2
            object.addBall(ballx, bally, ballz, strength, subtract)
        }
        if (floor) object.addPlaneY(2, 12)
        if (wallz) object.addPlaneZ(2, 12)
        if (wallx) object.addPlaneX(2, 12)

        object.update()
    }
    
    // LIGHTS
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0.5, 0.5, 1)
    scene.add(light) 
    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.set(0, 0, 100)
    scene.add(pointLight) 
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)
        
    // NOISE
    noise3D = NOISE.createNoise3D()
    const t0 = Math.random() * 10

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION
        const delta = clock.getDelta();
        time += delta * effectController.speed * 0.2;

        const t = t0 + 0.0001 // performance.now() * 0.0001

        effect.rotation.y += noise3D(0, 0, t + 10) * 0.01

        // marching cubes
        if (effectController.resolution !== resolution) {
            resolution = effectController.resolution;
            effect.init(Math.floor(resolution));
        }
        if (effectController.isolation !== effect.isolation) {
            effect.isolation = effectController.isolation;
        }
        updateCubes(effect, time, effectController.numBlobs, effectController.s, effectController.floor, effectController.wallx, effectController.wallz);
        
        renderer.render(scene, camera) // RENDER
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}



export function dispose() {
    cancelAnimationFrame(animation)
    effect?.dispose()
    controls?.dispose()
    geometry?.dispose()
    gui.destroy()
    material?.dispose()
    window.removeEventListener('resize', onWindowResize)
    noise3D = null
}