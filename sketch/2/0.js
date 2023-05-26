// Column + Cannon

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let geometryPlane
let material
let animation
let onWindowResize
let world
let pieceBody
let pieceGeometry
let controls
const pieceMaterials = []

export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    // CAMERA
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.y = 1.2
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
        gravity: new CANNON.Vec3(0, -8.9, 0)
    })
    // Default material

    const defaultMaterial = new CANNON.Material('default')
    const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
        friction: .9,
        restitution: 0,
        contactEquationStiffness: 1e5,
        contactEquationRelaxation: 2
    })
    world.defaultContactMaterial = defaultContactMaterial

    // COLUMNS
    const columnsNo = 12
    const columnsRadius = 9
    const columns = []
    const columnsPositions = []
    for (let i = 0; i < columnsNo; i++) {
        columnsPositions.push({
            x: columnsRadius * Math.cos((2 * Math.PI * i) / columnsNo),
            z: columnsRadius * Math.sin((2 * Math.PI * i) / columnsNo)
        })
    }
    // COLUMNSMATERIALS
    const pieceColors = [0xff0000, 0x00ff00, 0xff00ff, 0xffff00, 0x0000ff]
    for (let i = 0; i < pieceColors.length; i++) {
        pieceMaterials.push(new THREE.MeshStandardMaterial({ color: pieceColors[i], roughness: 1 }))
    }
    // COLUMN
    const itemsNo = 7
    const addPiece = (col, id, pos, size) => {
        const sizeX = size * 2
        const sizeY = size + Math.random() * .1
        const sizeZ = size * 2
        const pieceBodyShape = new CANNON.Box(new CANNON.Vec3(sizeX, sizeY, sizeZ))
        pieceGeometry = new THREE.BoxGeometry(sizeX * 2, sizeY * 2, sizeZ * 2)
        const position = new CANNON.Vec3(
            pos.x - 0.05 + Math.random() * .005,
            15,
            pos.z - 0.05 + Math.random() * .005,
        )
        pieceBody = new CANNON.Body({
            position,
            mass: 1, // .5 + Math.random() * 2,
            shape: pieceBodyShape,
            allowSleep: true,
        })

        pieceBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI / Math.random())

        const piece = new THREE.Mesh(pieceGeometry, pieceMaterials[Math.round(Math.random() * (pieceMaterials.length - 1))])
        col.push({
            pieceBody: pieceBody,
            piece: piece,
        })
        world.addBody(col[id].pieceBody)
        scene.add(col[id].piece)
        col[id].piece.castShadow = true
        col[id].piece.receiveShadow = false
    }

    for (let i = 0; i < columnsNo; i++) {
        const column = []
        const maxSize = 0.4
        columns.push(column)
        for (let j = 0; j < itemsNo; j++) {
            let size = maxSize - j * 0.02
            setTimeout(() => {
                addPiece(columns[i], j, columnsPositions[i], size)
            }, j * 5000 + Math.random() * 2000)
        }
        // console.log(columns[i])
    }


    // Static ground plane
    geometryPlane = new THREE.PlaneGeometry(100, 100)
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0x442200})
    const plane = new THREE.Mesh(geometryPlane, planeMaterial)
    plane.castShadow = false
    plane.receiveShadow = true
    const groundBody = new CANNON.Body({
        position: new CANNON.Vec3(0, 0, 0),
        mass: 0,
        shape: new CANNON.Plane(),
    })
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    scene.add(plane)
    world.addBody(groundBody)
    plane.position.copy(groundBody.position)
    plane.quaternion.copy(groundBody.quaternion)

    // LIGHTS
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 2, 5)
    light.castShadow = true
    scene.add(light)
    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.set(0, 0, 100)
    scene.add(pointLight)
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.y = 2.5
    controls.update()

    // ANIMATE
    const timeStep = 1 / 60 // seconds
    let lastCallTime
    const animate = () => {
        stats.begin() // XXX

        const time = performance.now() / 1000 // seconds
        if (!lastCallTime) {
            world.step(timeStep)
        } else {
            const dt = time - lastCallTime
            world.step(timeStep, dt)
        }
        lastCallTime = time

        // CANNON
        // world.fixedStep()
        for (let i = 0; i < columns.length; i++) {
            for (let j = 0; j < columns[i].length; j++) {
                columns[i][j].piece.position.copy(columns[i][j].pieceBody.position)
                columns[i][j].piece.quaternion.copy(columns[i][j].pieceBody.quaternion)
            }
        }

        camera.rotateY(.0001)
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
    controls?.dispose()
    geometryPlane?.dispose()
    pieceGeometry?.dispose()
    material?.dispose()
    for (let i = 0; i < pieceMaterials.length; i++) {
        pieceMaterials[i]?.dispose()
    }
    world = null
    let id = window.setTimeout(function () { }, 0)
    while (id--) {
        window.clearTimeout(id)
    }
    window?.removeEventListener('resize', onWindowResize)
}