// Marching cubes


import Stats from 'three/addons/libs/stats.module.js' // XXX
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { PerspectiveCamera } from 'three';

let renderer
let scene
let material
let effect
let reflectionCube
let animation
let onWindowResize

let effectController // per GUI
let attractorController // test GUI per attrattore 

export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    let time = 0
    const clock = new THREE.Clock()

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    canvas3D.appendChild(renderer.domElement)

    // CAMERA
    let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000) // era 75, window.innerWidth / window.innerHeight, 0.1, 1000
    camera.position.y = 0
    camera.position.z = 70 // era 50

    // WINDOW RESIZE
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize)

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)
    // controls.minDistance = 30;
	// controls.maxDistance = 30; // può essere che ci servano per bloccare la camera

    // GUI
    setupGui();
    
    // SCENE
    scene = new THREE.Scene()

    // GUI 
    // per controllare alcuni elementi della scena
    function setupGui() {

        // test attrattore GUI
        /* attractorController = {
            attractor_x: 0,
            attractor_y: 0,
            attractor_z: 0
        } */
        
        let h;
    
        const gui = new GUI();
    
        // simulation
        // h = gui.addFolder( 'Simulation' );
       
        //test attractor 
        /* h.add( attractorController, 'attractor_x', -10, 10, 0.05);
        h.add( attractorController, 'attractor_y', -10, 10, 0.05);
        h.add( attractorController, 'attractor_z', -10, 10, 0.05); */

        // camera
        h = gui.addFolder( 'Camera' );
        h.add( camera.position , 'x', -500, 500, 0.05 );
        h.add( camera.position , 'y', -500, 500, 0.05 );
        h.add( camera.position , 'z', -500, 500, 0.05 );
    }

    // SFERA ATTRATTORE
    const geometry = new THREE.SphereGeometry( 5, 32, 16 ); 
    const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
    const attractor = new THREE.Mesh( geometry, sphereMaterial ); 
    scene.add( attractor ); 

    // test sfera attrattore
    /* function updateAttractor(attractor_x, attractor_y, attractor_z) {
        attractor.position.set(attractor_x, attractor_y, attractor_z);
    }  */

    // MOUSE CLICK
    window.addEventListener('click', function() {
        // MOUSE POINTER
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
    
        function onPointerMove( event ) {
            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            attractor.position.set(pointer.x*70, pointer.y*30, 0 )
            console.log(pointer);
        }
        // update the picking ray with the camera and pointer position
        raycaster.setFromCamera( pointer, camera );
        window.addEventListener( 'pointermove', onPointerMove );
    })
    
    // LIGHTS
    /* const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0.5, 0.5, 1)
    scene.add(light) */
    /* const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.set(0, 0, 100)
    scene.add(pointLight) */
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)
    
    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION

        // test sfera attrattore GUI
        // updateAttractor(attractorController.attractor_x, attractorController.attractor_y, attractorController.attractor_z);
        
        renderer.render(scene, camera) // RENDER
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}



export function dispose() {
    cancelAnimationFrame(animation)
    renderer.dispose()
    material.dispose()
    window.removeEventListener('resize', onWindowResize)
}