// Marching cubes


import Stats from 'three/addons/libs/stats.module.js' // XXX
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { PerspectiveCamera } from 'three';

let scene
let material
let effect
let reflectionCube
let animation
let onWindowResize
let controls

let effectController // per GUI
let attractorController // test GUI per attrattore 



export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    let time = 0
    const clock = new THREE.Clock()

    
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
    controls = new OrbitControls(camera, renderer.domElement)
    // controls.minDistance = 30;
	// controls.maxDistance = 30; // può essere che ci servano per bloccare la camera

    // GUI
    setupGui();
    
    // SCENE
    scene = new THREE.Scene()

    // TEXTURE
    const path = './assets/textures/cube/studioSmallHDRI/'
    const format = '.png'
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ]
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    reflectionCube = cubeTextureLoader.load(urls)
    material = new THREE.MeshStandardMaterial({ color: 0xffffff, envMap: reflectionCube, roughness: 0, metalness: 1 })
    // material = new THREE.MeshStandardMaterial({ color: 0xaaaaff, envMap: reflectionCube, roughness: 0, metalness: 1, wireframe: true }) // versione wireframe

    let resolution = 32; 

    // GUI 
    // per controllare alcuni elementi della scena
    function setupGui() {
        /* const createHandler = function ( id ) {
            return function () {
                current_material = id;
                effect.material = materials[ id ];
                effect.enableUvs = ( current_material === 'textured' ) ? true : false;
                effect.enableColors = ( current_material === 'colors' || current_material === 'multiColors' ) ? true : false;
            };
        }; */

        // test attrattore GUI
        attractorController = {
            attractor_x: 0,
            attractor_y: 0,
            attractor_z: 0
        }

        // effect
        effectController = {
            dx: 5,
            sx: 0.1,
            sy: 0.3,
            sz: 0.5,
            speed: 1,
            numBlobs: 5, 
            resolution: 90, 
            isolation: 200, 
            floor: false,
            wallx: false,
            wallz: false,
            dummy: function () { }
        }
        
        let h;
    
        const gui = new GUI();
    
        // simulation
        h = gui.addFolder( 'Simulation' );
       
        //test attractor 
        /* h.add( attractorController, 'attractor_x', -10, 10, 0.05);
        h.add( attractorController, 'attractor_y', -10, 10, 0.05);
        h.add( attractorController, 'attractor_z', -10, 10, 0.05); */

        h.add( effectController, 'dx', -10, 10, 0.05);
        h.add( effectController, 'sx', -10, 10, 0.05);
        h.add( effectController, 'sy', -10, 10, 0.05);
        h.add( effectController, 'sz', -10, 10, 0.05);
        h.add( effectController, 'speed', 0.1, 8.0, 0.05 );
        h.add( effectController, 'numBlobs', 1, 50, 1 );
        h.add( effectController, 'resolution', 14, 100, 1 );
        h.add( effectController, 'isolation', 10, 300, 1 );
    
        h.add( effectController, 'floor' );
        h.add( effectController, 'wallx' );
        h.add( effectController, 'wallz' );

        // camera
        h = gui.addFolder( 'Camera' );
        h.add( camera.position , 'x', -500, 500, 0.05 );
        h.add( camera.position , 'y', -500, 500, 0.05 );
        h.add( camera.position , 'z', -500, 500, 0.05 );

        // material (type)
        /* h = gui.addFolder( 'Materials' );
        for ( const m in materials ) {
            effectController[ m ] = createHandler( m );
            h.add( effectController, m ).name( m );
        } */
    }

    effect = new MarchingCubes(resolution, material, true, true, 100000) // 100000 numero massimo di poly
    effect.position.set(0, 0, 0)
    effect.scale.set(50, 50, 50)
    effect.enableUvs = false
    effect.enableColors = false
    scene.add(effect)

    // this controls content of marching cubes voxel field
    function updateCubes(object, time, numblobs, dx, sx, sy, sz, floor, wallx, wallz) {
        object.reset()
        // fill the field with some metaballs
        const subtract = 12; // a cosa serve?
        const strength = 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1) // dimensione delle sfere (dipende da quanti blob ci sono in scena). Da 1.2 a 2
        
        for (let i = 0; i < numblobs; i++) {
            // codice del prof per far muovere le sfere
            /* const ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5
            const bally = Math.abs(Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i))) * 0.77 // dip into the floor
            const ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin((0.92 + 0.53 * i))) * 0.27 + 0.5 */

            // sfere statiche in basso (inizio dello spettacolo)
            // const ballx = i/dx + Math.sin(i/sx + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5 // posizione x delle sfere
            const ballx = i/dx + sx
            const bally = sy // posizione y
            const ballz = sz // posizione z
            object.addBall(ballx, bally, ballz, strength, subtract)
        }
        if (floor) object.addPlaneY(2, 12)
        if (wallz) object.addPlaneZ(2, 12)
        if (wallx) object.addPlaneX(0.1, 12)

        object.update()
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
            attractor.position.set(pointer.x*40, pointer.y*25, 0 )
            // console.log(pointer);
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
        const delta = clock.getDelta();
        time += delta * effectController.speed * 0.5;
        // marching cubes
        if (effectController.resolution !== resolution) {
            resolution = effectController.resolution;
            effect.init(Math.floor(resolution));
        }
        if (effectController.isolation !== effect.isolation) {
            effect.isolation = effectController.isolation;
        }
        updateCubes(effect, time, effectController.numBlobs, effectController.dx, effectController.sx, effectController.sy, effectController.sz, effectController.floor, effectController.wallx, effectController.wallz);
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
    controls.dispose()
    material.dispose()
    window.removeEventListener('resize', onWindowResize)
}