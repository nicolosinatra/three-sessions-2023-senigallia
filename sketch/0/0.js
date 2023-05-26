// Particles grid + Shader + Wave effect

import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let scene
let material
let geometry
let particles
let count = 0
let animation
let onWindowResize
let controls

export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

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
    controls = new OrbitControls(camera, renderer.domElement)

    // SCENE
    scene = new THREE.Scene()
    const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50
    const numParticles = AMOUNTX * AMOUNTY
    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)
    let i = 0, j = 0
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2) // x
            positions[i + 1] = 0 // y
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2) // z
            scales[j] = 1;
            i += 3;
            j++;
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

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION
        const positions = particles.geometry.attributes.position.array;
        const scales = particles.geometry.attributes.scale.array;
        let i = 0, j = 0
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50)
                scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 20 + (Math.sin((iy + count) * 0.5) + 1) * 20
                i += 3
                j++
            }
        }
        particles.geometry.attributes.position.needsUpdate = true
        particles.geometry.attributes.scale.needsUpdate = true
        count += 0.1

        renderer.render(scene, camera) // RENDER
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    controls.dispose()
    geometry?.dispose()
    material?.dispose()
    window.removeEventListener('resize', onWindowResize)
}