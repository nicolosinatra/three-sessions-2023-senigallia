// Particles grid + Shader + MIC lines
// Grid radial

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let scene
let material
let geometry
let particles
let gui
let animation
let onWindowResize
let controls

export function sketch() {
    console.log("Sketch launched")

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

    const p = {
        SEPARATION : 50,
        AMOUNTX : 100,
        AMOUNTY : 40
    }
    
    const numParticles = p.AMOUNTX * p.AMOUNTY
    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)

    function updateParticles(SEPARATION, AMOUNTX, AMOUNTY) {
        //object.reset()
        const meshRef = THREE.InstancedMesh
        const tmpMatrix = new THREE.Matrix4()
        const normQuadrantHypotenuse = Math.hypot(0.5, 0.5)
        let instanceIdx, normGridX, normGridY, normRadialOffset
        let i = 0, j = 0
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                instanceIdx = ix * AMOUNTX + iy
                normGridX = ix / (AMOUNTY - 1)
                normGridY = iy / (AMOUNTX - 1)
                normRadialOffset = Math.hypot(normGridX - 0.5, normGridY - 0.5) / normQuadrantHypotenuse
                positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2) // x
                positions[i + 1] = 0 // y
                positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2) // z
                scales[j] = 1
                i += 3
                j++
            }
        }
        return positions
        //object.update()
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
    particlesFolder.add(p, 'SEPARATION', 0, 100)
    particlesFolder.add(p, 'AMOUNTX', 0, 200)
    particlesFolder.add(p, 'AMOUNTY', 0, 200)
    const planeFolder = gui.addFolder('Plane')
    planeFolder.add(particles.rotation, 'x', 0, Math.PI * 2)
    planeFolder.add(particles.rotation, 'y', 0, Math.PI * 2)
    planeFolder.add(particles.rotation, 'z', 0, Math.PI * 2)
    planeFolder.open()
    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(camera.position, 'x', -2500, 2500)
    cameraFolder.add(camera.position, 'y', 0, 2000)
    cameraFolder.add(camera.position, 'z', -1500, 1500)
    cameraFolder.open()
    /* const freqAmplitudeFolder = gui.addFolder('Ampiezza')
    freqAmplitudeFolder.add(freqAmplitude, 'max', 0, 200)
    freqAmplitudeFolder.open() */


    // ANIMATE
    const animate = () => {
        if (showStats) stats.begin() // XXX
        
        // ANIMATION
        const positions = particles.geometry.attributes.position.array;
        const scales = particles.geometry.attributes.scale.array;
        const gridSizeX = p.AMOUNTY * p.SEPARATION // * cubeSideLength (0.025)
        const gridSizeY = p.AMOUNTX * p.SEPARATION // * cubeSideLength (0.025)

        
        if (typeof MIC != 'undefined') {
            let instanceIdx, normGridX, normGridY, x, y, z
            updateParticles(p.SEPARATION, p.AMOUNTX, p.AMOUNTY)
            let i = 0, j = 0
            for (let ix = 0; ix <= p.AMOUNTX; ix++) {
                for (let iy = 0; iy < p.AMOUNTY; iy++) {
                    instanceIdx = ix * p.AMOUNTX + iy
                    normGridX = ix / (p.AMOUNTY - 1)
                    normGridY = iy / (p.AMOUNTX - 1)

                    positions[i] = gridSizeX * (normGridX - 0.5)
                    positions[i + 1] = gridSizeY * (normGridY - 0.5)
                    const freqAmplitude = MIC.mapSound(i/3, numParticles, 1, 500)
                    positions[i + 2] = freqAmplitude / 5
                    scales[j] = 2 + freqAmplitude / 20
                    i += 3
                    j++
                }
            }
            tmpMatrix.setPosition(positions[i], positions[i + 1], positions[i + 2])
            meshRef.current.setMatrix(instanceIdx, tmpMatrix)
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
    controls?.dispose()
    geometry?.dispose()
    material?.dispose()
    gui?.destroy()
    window?.removeEventListener('resize', onWindowResize)
}