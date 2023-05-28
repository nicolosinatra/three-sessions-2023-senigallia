import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let scene
let material
let material2
let geometry
let geometry2
let animation
let onWindowResize
let gui
let textureEquirec, textureCube
let controls

export function sketch() {
    console.log("Sketch launched")

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

    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement)

    // SCENE
    scene = new THREE.Scene()
    material = new THREE.MeshPhongMaterial({ specular: 0x000000, shininess: 1 })
    // ...
    // scene.add(X)

    //texture
    const loader = new THREE.CubeTextureLoader()
    loader.setPath('/assets/textures/cube/teatro/')

    textureCube = loader.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
    textureCube.colorSpace = THREE.SRGBColorSpace

    const textureLoader = new THREE.TextureLoader()

    textureEquirec = textureLoader.load('/assets/textures/metal/MetalStainlessSteelBrushedElongated005_COL_4K_METALNESS.jpg')
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping
    textureEquirec.colorSpace = THREE.SRGBColorSpace

    scene.background = ({ color: "#808080" })


    //sfera
    geometry = new THREE.SphereGeometry(1, 50, 50)
    const material1 = new THREE.MeshBasicMaterial({ envMap: textureCube })
    const sphere = new THREE.Mesh(geometry, material1)
    scene.add(sphere)
    sphere.position.x = 1.5

    geometry2 = new THREE.SphereGeometry(1, 50, 50)
    material2 = new THREE.MeshPhysicalMaterial({
        envMap: textureEquirec,
        metalness: 0.3,
        roughness: 0.8,
        color: "#C3C8C9"
    })
    const sphere2 = new THREE.Mesh(geometry2, material2)
    scene.add(sphere2)
    sphere2.position.x = -1.5

    // LIGHTS
    const light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight({ color: "#666666", intensity: 0.05 })
    directionalLight.position.set(1, 0, 7)
    scene.add(directionalLight)


    const params = {
        Cube: function () {

            scene.background = textureCube;

            sphereMaterial.envMap = textureCube;
            sphereMaterial.needsUpdate = true;

        },
        Equirectangular: function () {

            scene.background = textureEquirec;

            sphereMaterial.envMap = textureEquirec;
            sphereMaterial.needsUpdate = true;

        },
        Refraction: false
    };

    // GUI
    gui = new GUI.GUI()
    const nameFolder = gui.addFolder('Name of the folder')
    nameFolder.add(sphere.rotation, 'x', 0, Math.PI * 2)
    nameFolder.open()
    // ...

    // ANIMATE
    const animate = () => {
        if (showStats) stats.begin() // XXX

        // ANIMATION

        // ...

        renderer.render(scene, camera) // RENDER
        if (showStats) stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    controls?.dispose()
    geometry?.dispose()
    geometry2?.dispose()
    material2?.dispose()
    material?.dispose()
    gui?.destroy()
    window.removeEventListener('resize', onWindowResize)
}
