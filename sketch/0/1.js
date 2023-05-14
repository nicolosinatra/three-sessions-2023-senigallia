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
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // ANIMATE
    function animate() {
        requestAnimationFrame(animate) // CIAK

        // ANIMATION
        cube.rotation.x += 0.04
        cube.rotation.y += 0.01
        // ...
        
        renderer.render(scene, camera) // RENDER
    }
    animate()
}