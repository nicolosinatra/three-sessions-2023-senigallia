
import Stats from 'three/examples/jsm/libs/stats.module.js' 
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';



export function sketch(canvas3D, THREE) {
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
        renderer.setAnimationLoop(animate);
     

// CAMERA
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 1000


// WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize) 
    
// CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)

//SCENE
const scene = new THREE.Scene()

 //sfere
const sphere = new THREE.SphereGeometry(1, 50, 50)
const sphere2 = new THREE.SphereGeometry(1, 50, 50)
const material1 = new THREE.MeshSatandarMaterial({ 
    map: colorTexture,
    roughness: .1, 
    metalness: .9
})
const material2 = new THREE.MeshSatandarMaterial({ 
    color: 0xff0000,
    roughness: .9, 
    metalness: .5
})
const mesh = new THREE.Mesh(sphere, sphere2, material)
scene.add(mesh)
sphere.positin.x = 1.5;
sphere2.position.x = -1.5;
//texture
const textureLoader = new THREE.TextureLoader( loadingManager)
const colorTexture = textureLoader.load ('public/assets/texture/cube/MilkyWay/dark-s_pz.jpg')
colorTexture.generateMipmaps = false
colorTexture.minFilter = THREENearestFilter


// LIGHTS
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0.5, 0.5, 1)
    scene.add(light)
    const pointLight = new THREE.PointLight(0xff0000)
    pointLight.position.set(0, 0, 100)
    scene.add(pointLight)
    const ambientLight = new THREE.AmbientLight(0xfffa00)
    scene.add(ambientLight)


//animate
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    //update controls
    controls.update()

    //render
    renderer.render(scene, camera)
    stats.end() // XXX

    //chiamo tick
    window.requestAnimationFrame( tick )

}

tick()

}

export function dispose() {
    cancelAnimationFrame(animation)
    renderer.dispose()
    geometry.dispose()
    material.dispose()
    window.removeEventListener('resize', onWindowResize)
}
