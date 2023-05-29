// Particles grid + Shader + MIC points

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let scene
let material
let geometry
let particles
let animation
let onWindowResize

export function sketch() {
    console.log("Sketch launched")

    // CAMERA
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.y = 1000

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)

    // SCENE
    scene = new THREE.Scene()
    const gridUnit = 50
    const columnsTot = 10
    const rowsTow = 10
    const numParticles = columnsTot * rowsTow
    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)
    let i = 0, j = 0
    for (let ix = 0; ix < columnsTot; ix++) {
        for (let iy = 0; iy < rowsTow; iy++) {
            positions[i] = ix * gridUnit - ((columnsTot * gridUnit) / 2) // x
            positions[i + 1] = 0 // y AUDIO
            positions[i + 2] = iy * gridUnit - ((rowsTow * gridUnit) / 2) // z
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

    // ANIMATE
    const animate = () => {
        if (showStats) stats.begin() // XXX

        const freqNo = columnsTot / 2

        // ANIMATION
        const positions = particles.geometry.attributes.position.array;
        const scales = particles.geometry.attributes.scale.array;
        if (typeof MIC != 'undefined') {
            let i = 0, j = 0
            for (let ix = Math.round(columnsTot/2; ix < columnsTot; ix++) {
                for (let iy = 0; iy < rowsTow; iy++) {
                    const freqAmplitude = MIC.mapSound(i / 3, numParticles, 1, 200)
                    positions[Math.round(positions.length / 2) + i + 1] = freqAmplitude
                    positions[Math.round(positions.length / 2) - i + 1] = freqAmplitude
                    // positions[i + 1] = freqAmplitude
                    scales[j] = 2 + freqAmplitude / 10
                    i += 3
                    j++

                }
            }
        }
        particles.geometry.attributes.position.needsUpdate = true
        particles.geometry.attributes.scale.needsUpdate = true

        renderer.render(scene, camera) // RENDER
        if (showStats) stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}

export function dispose() {
    cancelAnimationFrame(animation)
    geometry?.dispose()
    material?.dispose()
    window.removeEventListener('resize', onWindowResize)
}