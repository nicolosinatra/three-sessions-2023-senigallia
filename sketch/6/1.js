let scene
let material
let geometry
let animation
let onWindowResize
let slideShow
let images = []

export function sketch() {
    console.log("Sketch launched")

    const loadImage = (path, format) => {
        const imageLoader = new THREE.TextureLoader()
        const url = path + format
        images.push(
            imageLoader.load(url, (image) => {
                console.log('loadedImage: ' + image)
            })
        )
    }

    loadImage('https://allyourhtml.club/carousel/lion', '.jpg')
    loadImage('https://allyourhtml.club/carousel/lion', '.jpg')
    loadImage('https://allyourhtml.club/carousel/lion', '.jpg')
    loadImage('https://allyourhtml.club/carousel/lion', '.jpg')
    loadImage('https://allyourhtml.club/carousel/lion', '.jpg')


    const imageDefault = images[0]
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
            uTexture: { value: imageDefault },
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
    slideShow = setInterval(() => {
        material.uniforms.uTexture.value = images[Math.round(Math.random() * images.length)]
        console.log('image changed random')
    }, 2000)

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
    if (slideShow) clearInterval(slideShow)
    geometry?.dispose()
    material?.dispose()
    for (let i = 0; i < images.length; i++) {
        images[i].dispose()
    }
    images = null
    window.removeEventListener('resize', onWindowResize)
}