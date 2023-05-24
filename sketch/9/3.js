// Cube + Cannon

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let renderer
let geometry
let material
let animation
let onWindowResize
let world
let body

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

    // CANNON
    world = new CANNON.World()
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
    body = new CANNON.Body({
        mass: 1,
    })
    body.addShape(shape)
    body.angularVelocity.set(0, 10, 0)
    body.angularDamping = 0.5
    world.addBody(body)

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // CANNON
        world.fixedStep()
        cube.position.copy(body.position)
        cube.quaternion.copy(body.quaternion)

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
    material?.dispose()
    body = null
    world = null 
    window?.removeEventListener('resize', onWindowResize)
}