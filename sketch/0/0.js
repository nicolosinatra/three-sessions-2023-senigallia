import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js'

export function sketch(canvas3D, THREE) {
    console.log("Sketch launched")

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    canvas3D.appendChild(renderer.domElement)

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // SCENE
    const scene = new THREE.Scene()
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // POST-PROCESSING
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)
    const glitchPass = new GlitchPass()
    composer.addPass(glitchPass)

    // ANIMATE
    function animate() {
        requestAnimationFrame(animate) // CIAK

        // ANIMATION
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
        // ...
        
        renderer.render(scene, camera) // RENDER
        composer.render() // POST-PROCESSING
    }
    animate()
}