import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let scene
let material
let geometry
let animation
let onWindowResize
let image

export function sketch() {
    console.log("Sketch launched")

    image = textures[4].texture
    const imageAspect = 1.77

    // CAMERA
    const camera = new THREE.OrthographicCamera(
        -0.5, 0.5, 0.5, -0.5, // bounds
        -10, 10
    )
    camera.position.z = 5

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        const viewportAspect = window.innerWidth / window.innerHeight
        if (imageAspect > viewportAspect) {
            shaderScale.set(imageAspect / viewportAspect, 1)
        } else {
            shaderScale.set(1, viewportAspect / imageAspect)
        }
    }
    window.addEventListener('resize', onWindowResize)

    // SCENE
    scene = new THREE.Scene()
    geometry = new THREE.PlaneGeometry(1, 1)
    material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            uTexture: { value: image },
            scale: { value: new THREE.Vector2(1, 1) }
        },
        vertexShader: `varying vec2 vUv;
                        void main(){
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                        }`,
        fragmentShader: `uniform sampler2D uTexture;
                         uniform vec2 scale;
                         varying vec2 vUv;
                         void main(){
                            // SCALE, background size cover
                            vec2 newUV = (vUv - vec2(0.5))/scale + vec2(0.5);
                            gl_FragColor = texture2D(uTexture,newUV);
                         }`
    })
    const shaderScale = material.uniforms.scale.value
    setTimeout(() => {
        material.uniforms.uTexture.value = textures[0].texture
    }, 5000)

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    onWindowResize()

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
    geometry?.dispose()
    material?.dispose()
    image = null
    window.removeEventListener('resize', onWindowResize)
}