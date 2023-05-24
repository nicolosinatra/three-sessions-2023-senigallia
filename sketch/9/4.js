// Cube + Cannon

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Vec3 } from 'cannon-es'

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
    let camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = -100

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // SCENE + CANNON
    const scene = new THREE.Scene()
    const INSTANCES = 40
    geometry = new THREE.SphereGeometry(1, 64, 32)
    material = new THREE.MeshMatcapMaterial()
    let spheres = new THREE.InstancedMesh(geometry, material, INSTANCES)
    scene.add(spheres)
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, 0, 0), // m/s²
        frictionGravity: new CANNON.Vec3(1,1,1)
    })
    // const physicsMaterial = new CANNON.Material("groundMaterial")
    // const physicsContactMaterial = new CANNON.ContactMaterial(
    //     physicsMaterial,      // Material #1
    //     physicsMaterial,      // Material #2
    //     {
    //         friction: 0.9,
    //         restitution: 0.1
    //     }
    // )
    // world.addContactMaterial(physicsContactMaterial)
    let spheresMeshes = []
    let spheresBodies = []
    let v3 = new CANNON.Vec3()
    for (let i = 0; i < INSTANCES; i++) {
        let r = Math.random(4) + 2
        let sphereMesh = new THREE.Object3D()
        sphereMesh.scale.setScalar(r)
        sphereMesh.position.randomDirection().setLength(Math.random() * 50)
        scene.add(sphereMesh)
        const sphereShape = new CANNON.Sphere(r)
        const sphereBody = new CANNON.Body({
            mass: 1,
            // material: physicsMaterial 
        })
        sphereBody.addShape(sphereShape)
        sphereBody.position.x = sphereMesh.position.x
        sphereBody.position.y = sphereMesh.position.y
        sphereBody.position.z = sphereMesh.position.z
        world.addBody(sphereBody)
        sphereMesh.updateMatrix()
        spheres.setMatrixAt(i, sphereMesh.matrix)
        //spheres.setColorAt(i, c.set(Math.random() * 0x7f7f7f + 0x7f7f7f));
        spheresMeshes.push(sphereMesh)
        spheresBodies.push(sphereBody)
    }

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);

    // ANIMATE
    let clock = new THREE.Clock()
    let delta = 0
    const animate = () => {
        stats.begin() // XXX

        // CANNON
        delta = Math.min(clock.getDelta(), 0.1)
        world.step(delta)
        // world.fixedStep()
        spheresMeshes.forEach((sMesh, id) => {
            let sBody = spheresBodies[id]
            sMesh.position.copy(sBody.position)
            sMesh.quaternion.copy(sBody.quaternion)
            sMesh.updateMatrix()
            spheres.setMatrixAt(id, sMesh.matrix)
            sBody.applyForce(v3.copy(sBody.position).negate().scale(3))
        })
        spheres.instanceMatrix.needsUpdate = true
        // let cPosition = new CANNON.Vec3(body.position.x, body.position.y, body.position.z)
        // body.applyForce(body.position.normalize().multiplyScalar(1).toArray(), [0, 0, 0])
        // cube.position.copy(body.position)
        // cube.quaternion.copy(body.quaternion)

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