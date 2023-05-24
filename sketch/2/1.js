// Column + Cannon

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let renderer
let geometry
let geometryPlane
let material
let animation
let onWindowResize
let world
let body, body2

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
    camera.position.z = 5

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // SCENE + CANNON
    // add ground
    // multiple cubes (for/circle)

    // World
    const scene = new THREE.Scene()
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -2, 0)
    })

    // COLUMN
    // column = []
    // for (let c=0; c<5; c++) {
    //     // ...
    // }
    
    // Cube
    const unitSize = 0.2
    const unitSize3 = 0.4
    geometry = new THREE.BoxGeometry(unitSize3, unitSize3, unitSize3)
    material = new THREE.MeshNormalMaterial()
    const cube = new THREE.Mesh(geometry, material)
    body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(unitSize, unitSize, unitSize)),
        position: new CANNON.Vec3(0, unitSize * 10, 0)
    })
    scene.add(cube)
    world.addBody(body)

    // Static ground plane
    geometryPlane = new THREE.PlaneGeometry(10, 10)
    const plane = new THREE.Mesh(geometryPlane, material)
    const groundBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Plane(),
        position: new CANNON.Vec3(0, -1, 0)
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    scene.add(plane)
    plane.rotation.x = - Math.PI / 2
    plane.position.y = -1
    world.addBody(groundBody)

    // body.angularVelocity.set(0, 10, 0)
    // body.angularDamping = 0.5

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // CANNON
        world.fixedStep()
        cube.position.copy(body.position)
        cube.quaternion.copy(body.quaternion)
        cube2.position.copy(body2.position)
        cube2.quaternion.copy(body2.quaternion)

        // ANIMATION
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
    geometryPlane?.dispose()
    material?.dispose()
    body, body2 = null
    world = null
    window?.removeEventListener('resize', onWindowResize)
}