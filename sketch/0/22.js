// Particles grid + Shader + MIC lines
// Grid random, diffusione lineare

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let scene
let material
let geometry
let particles
let gui
let animation
let onWindowResize
let controls
let stats

export function sketch() {
    console.log("Sketch launched")
    stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    // CAMERA
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.y = 1200

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
    const SEPARATION = 50
    const AMOUNTX = 100
    const AMOUNTY = 20
    const numParticles = AMOUNTX * AMOUNTY
    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)
    let i = 0, j = 0
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2) // x
            positions[i + 1] = 0 // y
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2) // z
            scales[j] = 1
            i += 3
            j++
        }
    }
    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
    material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) },
        },
        vertexShader: `attribute float scale;
                       void main() {
                           vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                           gl_PointSize = scale * ( 300.0 / - mvPosition.z );
                           gl_Position = projectionMatrix * mvPosition;
                       }`,
        fragmentShader: `uniform vec3 color;
                         void main() {
                           if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
                           gl_FragColor = vec4( color, 1.0 );
                         }`
    })
    particles = new THREE.Points(geometry, material);
    scene.add(particles);


    // GUI
    gui = new GUI.GUI()
    const particlesFolder = gui.addFolder('Particles')
    particlesFolder.add(particles.rotation, 'x', 0, Math.PI * 2)
    particlesFolder.add(particles.rotation, 'y', 0, Math.PI * 2)
    particlesFolder.add(particles.rotation, 'z', 0, Math.PI * 2)
    particlesFolder.open()
    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(camera.position, 'x', -2500, 2500)
    cameraFolder.add(camera.position, 'y', 0, 1000)
    cameraFolder.add(camera.position, 'z', -1500, 1500)
    cameraFolder.open()


    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION
        const positions = particles.geometry.attributes.position.array;
        const scales = particles.geometry.attributes.scale.array;
        if (typeof MIC != 'undefined') {
            let i = 0, j = 0
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    const freqAmplitude = MIC.mapSound(i/3, numParticles, 1, 500)
                    positions[i + 1] = freqAmplitude / 5
                    scales[j] = 2 + freqAmplitude / 20
                    i += 3
                    j++
                }
            }
        }
        particles.geometry.attributes.position.needsUpdate = true
        particles.geometry.attributes.scale.needsUpdate = true

        renderer.render(scene, camera) // RENDER
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    canvas3D?.removeChild(stats.dom)
    controls?.dispose()
    geometry?.dispose()
    material?.dispose()
    gui?.destroy()
    window?.removeEventListener('resize', onWindowResize)
}