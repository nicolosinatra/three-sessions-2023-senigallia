// clouds at the top of the screen


import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { PerspectiveCamera } from 'three';

let scene
let material, current_material
let reflectionCube, dispMap, diffMap, bumpMap
let effect
let animation
let onWindowResize
let noise3D
let controls
let gui
let stats

export function sketch() {
    console.log("Sketch launched")
    stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    const c = {
        // clouds 
        dimBlob: 0.4 + Math.random(),
        speedRotazione: 0.005, 
        sx: 0.2,
        sy: 0.2,
        sz: 0.2,
        speed: 0.02,
        numBlobs: 40 + Math.random() * 50, 
        resolution: 80, 
        isolation: 120, 
        wireframe: false,
        //dummy: function () { }

        //materials
        material: 'sky',

        // view
        lookAtCenter: new THREE.Vector3(0, 1, 0),
        cameraPosition: new THREE.Vector3(0, -15, 50),
        autoRotate: true,
        autoRotateSpeed: -1,
        camera: 35,
        near: 0.1,
        far: 1000,

        // world
        floor: false,
        wallx: false,
        wallz: false,
    }

    // MATERIALI   

    // material = c.material
    // material = new THREE.MeshStandardMaterial({ color: 0xaaaaff, envMap: reflectionCube, roughness: 0, metalness: 1, wireframe: true }) // versione wireframe

    current_material = 'sky';
    dispMap = global.textures[2].texture
    const materials = {
        'sky': new THREE.MeshStandardMaterial({ color: 0xffffff, envMap: global.cubeTextures[0].texture, roughness: 0, metalness: 1, wireframe: c.wireframe }),
        'sky_lucido': new THREE.MeshPhysicalMaterial({ color: 0xffffff, envMap: global.cubeTextures[0].texture, reflectivity: 1.0, transmission: 1.0, roughness: 0.0, metalness: 0.2, clearcoat: 0.2, clearcoatRoughness: 0.0, ior: 1.5, thickness: 4, fog: false, side: THREE.DoubleSide}),
		'teatro': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: global.cubeTextures[2].texture, roughness: 0, metalness: 1, wireframe: c.wireframe } ),
        'Facce_colori': new THREE.MeshStandardMaterial({ color: 0xffffff, envMap: global.textures[2].texture, roughness: 0, metalness: 1, wireframe: c.wireframe }),
    };
    dispMap.wrapS = dispMap.wrapT = THREE.RepeatWrapping
    dispMap.repeat.set(1, 1)

    let time = 0
    const clock = new THREE.Clock()
    
    // CAMERA
    let camera = new THREE.PerspectiveCamera(c.camera, window.innerWidth / window.innerHeight, c.near, c.far)
    camera.position.copy(c.cameraPosition)
    camera.lookAt(c.lookAtCenter)

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
	// controls.maxDistance = 30;

    // GUI
    gui = new GUI.GUI()
    setupGui()

    function setupGui() {
 
        // simulation
        const simulationFolder = gui.addFolder( 'Simulation' );

        simulationFolder.add( c, 'dimBlob', 0.01, 2, 0.01)
        simulationFolder.add( c, 'speedRotazione', 0.01, 2, 0.01 )
        simulationFolder.add( c, 'sx', 0.01, 1, 0.01)
        simulationFolder.add( c, 'sy', -1, 1, 0.01)
        simulationFolder.add( c, 'sz', 0.01, 1, 0.01)
        simulationFolder.add( c, 'speed', 0.01, 2, 0.01 )
        simulationFolder.add( c, 'numBlobs', 1, 100, 1 )
        simulationFolder.add( c, 'resolution', 10, 100, 1 )
        simulationFolder.add( c, 'isolation', 10, 300, 1 )
        simulationFolder.add( c, 'floor' )
        simulationFolder.add( c, 'wallx' )
        simulationFolder.add( c, 'wallz' )
        simulationFolder.open()

        // material
        const createHandler = function ( id ) {

            return function () {
                current_material = id;
                effect.material = materials[ id ];
                // effect.enableUvs = ( current_material === 'textured' ) ? true : false;
				// effect.enableColors = ( current_material === 'colors' || current_material === 'multiColors' ) ? true : false;
            };

        };
        const materialFolder = gui.addFolder( 'Materials' );

			for ( const m in materials ) {

				c [ m ] = createHandler( m );
				materialFolder.add( c, m ).name( m );
			}
            materialFolder.add( c, 'wireframe' )
            console.log(c.wireframe)

        // camera
        const cameraFolder = gui.addFolder( 'Camera' )
        cameraFolder.add( camera.position , 'x', 0, 1, 0.05 )
        cameraFolder.add( camera.position , 'y', -15, 10, 0.05 )
        cameraFolder.add( camera.position , 'z', 20, 150, 0.05 )
        cameraFolder.open()
    }
    
    // SCENE
    scene = new THREE.Scene()

    let resolution = 32; 

    effect = new MarchingCubes(resolution, materials[ current_material ], true, true, 100000) // 100000 numero massimo di poly
    effect.position.set(0, 0, 0)
    effect.scale.set(50, 50, 50)
    effect.enableUvs = false
    effect.enableColors = false
    scene.add(effect)
    
    // this controls content of marching cubes voxel field
    function updateCubes(object, time, numblobs, dimBlob, sx, sy, sz, floor, wallx, wallz) {
        object.reset()
        // fill the field with some metaballs
        const subtract = 12 // a cosa serve?
        const strength = dimBlob / ((Math.sqrt(numblobs) - 1) / 4 + 1) // dimensione delle sfere (dipende da quanti blob ci sono in scena)
        // const column = row /2

        for (let i = 0; i < numblobs; i++) {
            const ballx = 0.5 + (Math.sin(i * time * (Math.cos(i)))) * sx
            const bally = 0.5 + (Math.abs(Math.cos(i * time * Math.cos(i)))) * sy // dip into the floor
            const ballz = 0.5 + (Math.cos(i * time * Math.sin((i)))) * sz
            object.addBall(ballx, bally, ballz, strength, subtract)
        }
        if (floor) object.addPlaneY(2, 12)
        if (wallz) object.addPlaneZ(2, 12)
        if (wallx) object.addPlaneX(2, 12)
        object.update()
    }
    
    // LIGHTS
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0.5, 0.5, 1)
    scene.add(light) 
    const pointLight = new THREE.PointLight(0x4287f5)
    pointLight.position.set(0, 0, 100)
    scene.add(pointLight) 
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)
        
    // NOISE
    noise3D = NOISE.createNoise3D()
    const t0 = Math.random() * 10

    // ANIMATE
    const animate = () => {
        stats.begin() // XXX

        // ANIMATION
        const delta = clock.getDelta();
        time += delta * c.speed * 0.2;

        const t = t0 + 0.0001 // performance.now() * 0.0001

        effect.rotation.y += noise3D(0, 0, t + 10) * c.speedRotazione
        pointLight.position.x = pointLight.position.x + noise3D(0, t, 0) * .002
        pointLight.position.y = pointLight.position.y + noise3D(t + 4, 0, 0) * .003
        pointLight.position.z = pointLight.position.z + noise3D(0, 0, t + 8) * .001

        // marching cubes
        if (c.resolution !== resolution) {
            resolution = c.resolution;
            effect.init(Math.floor(resolution));
        }
        if (c.isolation !== effect.isolation) {
            effect.isolation = c.isolation;
        }
        updateCubes(effect, time, c.numBlobs, c.dimBlob, c.sx, c.sy, c.sz, c.floor, c.wallx, c.wallz);
        
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
    gui.destroy()
    material?.dispose()
    reflectionCube?.dispose()
    dispMap?.dispose()
    window.removeEventListener('resize', onWindowResize)
    noise3D = null
}