// looper 45 prove


import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { PerspectiveCamera } from 'three'

let scene
let material, current_material
let reflectionCube
let Maf_mix
let effect
let animation
let onWindowResize
let noise3D
let controls
let gui



export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    const c = {
        // clouds 
        dimBlob: 0.4 + Math.random(),
        speedRotazione: 0.005, 
        sx: 0.2,
        sy: 0.08,
        sz: 0.2,
        speed: 0.02,
        numBlobs: 10, 
        resolution: 80, 
        isolation: 120, 
        wireframe: false,
        //dummy: function () { }

        //materials
        //material: 'sky',

        // view
        lookAtCenter: new THREE.Vector3(0, 1, 0),
        cameraPosition: new THREE.Vector3(10,-10,10),
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

    // MATERIALE 
    

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
        // const createHandler = function ( id ) {

        //     return function () {
        //         current_material = id;
        //         effect.material = materials[ id ];
        //         // effect.enableUvs = ( current_material === 'textured' ) ? true : false;
		// 		// effect.enableColors = ( current_material === 'colors' || current_material === 'multiColors' ) ? true : false;
        //     };

        // };
        // const materialFolder = gui.addFolder( 'Materials' );

		// 	for ( const m in materials ) {

		// 		c [ m ] = createHandler( m );
		// 		materialFolder.add( c, m ).name( m );
		// 	}
        //     materialFolder.add( c, 'wireframe' )
        //     console.log(c.wireframe)

        // camera
        const cameraFolder = gui.addFolder( 'Camera' )
        cameraFolder.add( camera.position , 'x', 0, 1, 0.05 )
        cameraFolder.add( camera.position , 'y', -30, 10, 0.05 )
        cameraFolder.add( camera.position , 'z', 20, 150, 0.05 )
        cameraFolder.open()
    }
    
    // SCENE
    scene = new THREE.Scene()

    function getMaterial() {
        const material = new THREE.MeshStandardMaterial({color: 0x5186a6, metalness: .1, roughness: .5});
        material.onBeforeCompile = (shader) =>{
          shader.vertexShader = shader.vertexShader.replace(
            `varying vec3 vViewPosition;`,
            `varying vec3 vViewPosition;
        varying vec3 pos;
        varying vec2 vUv;`);
          shader.vertexShader = shader.vertexShader.replace(
            `#include <defaultnormal_vertex>`,
            `#include <defaultnormal_vertex>
        pos = position;
        vUv = pos.xy;`);
      
         shader.fragmentShader = shader.fragmentShader.replace(
            `varying vec3 vViewPosition;`,
            `varying vec3 vViewPosition;
        varying vec3 pos;
        varying vec2 vUv;
      
        vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {
        vec3 vSigmaX = dFdx( surf_pos );
        vec3 vSigmaY = dFdy( surf_pos );
        vec3 vN = surf_norm;    // normalized
        vec3 R1 = cross( vSigmaY, vN );
        vec3 R2 = cross( vN, vSigmaX );
        float fDet = dot( vSigmaX, R1 );
        vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
        return normalize( abs( fDet ) * surf_norm - vGrad );
      }
      
      #define M_PI 3.1415926535897932384626433832795
      #define TAU 2.*M_PI
      
      float pattern(float v, float v2) {
        float offset = .4 * (sin(TAU*opacity));
        return smoothstep( .45 + offset, .55+offset, .5 + .5 * sin( 10. * 2. * M_PI * v + 10. * opacity * 2. * M_PI ) );
      }
      `);
      
         shader.fragmentShader = shader.fragmentShader.replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `vec4 diffuseColor = vec4( diffuse, opacity );
        float r = sqrt(pos.x*pos.x+pos.y*pos.y+pos.z*pos.z);
        float theta = acos(pos.z/r);
        float phi = atan(pos.y,pos.x);
        float strip = pattern(vUv.y, vUv.x);
        float stripOffset = pattern(vUv.y-.001, vUv.x)-strip;
        float modifiedRoughness = .2 + .3*strip;
        diffuseColor.rgb = vec3(.8*strip);`);
      
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <roughnessmap_fragment>',
            `#include <roughnessmap_fragment>
            roughnessFactor = modifiedRoughness;`
          );
      
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <normal_fragment>',
            `#include <normal_fragment>
            normal = perturbNormalArb( -vViewPosition, normal, vec2( 0., -stripOffset ) );`
          );
      
          shader.fragmentShader = `#extension GL_OES_standard_derivatives : enable
          ${shader.fragmentShader}`;
      
        }
        return material;
    }

    let resolution = 32; 

    const material = getMaterial();
    effect = new MarchingCubes(resolution, material, true, true, 100000) // 100000 numero massimo di poly
    effect.position.set(0, 0, 0)
    effect.scale.set(5, 5, 5)
    effect.enableUvs = false
    effect.enableColors = false
    scene.add(effect)
    
    function pointsOnSphere(n) {
        const pts = [];
        const inc = Math.PI * (3 - Math.sqrt(5));
        const off = 2.0 / n;
        let r;
        var phi;
        let dmin = 10000;
        const prev = new THREE.Vector3();
        const cur = new THREE.Vector3();
        for (var k = 0; k < n; k++){
            cur.y = k * off - 1 + (off /2);
            r = Math.sqrt(1 - cur.y * cur.y);
            phi = k * inc;
            cur.x = Math.cos(phi) * r;
            cur.z = Math.sin(phi) * r;
    
            const dist = cur.distanceTo( prev );
            if( dist < dmin ) dmin = dist;
    
            pts.push(cur.clone());
            prev.copy( cur );
        }
        return pts;
    }

    const points = pointsOnSphere(c.numblobs);
    console.log(points)
    Maf_mix = function( x, y, a ) {
        if( a <= 0 ) return x;
        if( a >= 1 ) return y;
        return x + a * (y - x)
    };
    // this controls content of marching cubes voxel field
    function updateCubes( object, time, numblobs, cohesion, strength, subtract, dimBlob, sx, sy, sz, floor, wallx, wallz) {
        object.reset()
        // fill the field with some metaballs
        // fill the field with some metaballs
        var i, ballx, bally, ballz, subtract, strength;
        for ( i = 0; i < numblobs; i ++ ) {
            ballx = .5 + .35 * points[i].x;
            bally = .5 + .35 * points[i].y;
            ballz = .5 + .35 * points[i].z
            const c = .5 + .5 * Math.cos((cohesion+time + i/numblobs)); // const c = .5 + .5 * Math.cos((cohesion+time + i/numblobs) * Maf.TAU);
            ballx = Maf_mix( .5, ballx, c );
            bally = Maf_mix( .5, bally, c );
            ballz = Maf_mix( .5, ballz, c );
            object.addBall(ballx, bally, ballz, strength, subtract);
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

        // marching cubes
        if (c.resolution !== resolution) {
            resolution = c.resolution;
            effect.init(Math.floor(resolution));
        }
        if (c.isolation !== effect.isolation) {
            effect.isolation = c.isolation;
        }
        const subtract = 12 - 10 * (.5 + .5 * Math.cos( t * 2 * Math.PI)); // 2 * Math.PI ==> Maf.TAU
        const strength = .5;//.5 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

        updateCubes( effect, t, .5 + .5 * Math.sin( t * 2 * Math.PI ), strength, subtract, c.dimBlob, c.sx, c.sy, c.sz, c.floor, c.wallx, c.wallz );

        const tt = easings.InOutQuad(t);
        effect.rotation.y = .5 * Math.PI;
        effect.rotation.z = tt * 2 * Math.PI;
        
        renderer.render(scene, camera) // RENDER
        stats.end() // XXX

        animation = requestAnimationFrame(animate) // CIAK
    }
    animate()
}



export function dispose() {
    cancelAnimationFrame(animation)
    controls?.dispose()
    gui.destroy()
    material?.dispose()
    reflectionCube?.dispose()
    window.removeEventListener('resize', onWindowResize)
    noise3D = null
}