// looper 45 prove


import Stats from 'three/addons/libs/stats.module.js' // XXX
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { PerspectiveCamera } from 'three'

let scene
let reflectionCube
let effect
let animation
let onWindowResize
let controls
let gui
let material



export function sketch() {
    console.log("Sketch launched")
    const stats = new Stats() // XXX
    canvas3D.appendChild(stats.dom)

    const c = {
        // clouds 
        dimBlob: 0.4 + Math.random(),
        speedRotazione: 0.005, 
        ex:0, // posizione effetto
        ey:0,
        ez:0,
        sx: 0.2, // disposizione sfere
        sy: 0.08,
        sz: 0.2,
        rx: 0, // rotazione effetto
        ry: 0,
        rz: 0,
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
    
    function getMaterial() {
        const material = new THREE.MeshStandardMaterial({color: 0x5186a6, metalness: .1, roughness: .5});
    //     material.onBeforeCompile = (shader) =>{
    //       shader.vertexShader = shader.vertexShader.replace(
    //         `varying vec3 vViewPosition;`,
    //         `varying vec3 vViewPosition;
    //     varying vec3 pos;
    //     varying vec2 vUv;`);
    //       shader.vertexShader = shader.vertexShader.replace(
    //         `#include <defaultnormal_vertex>`,
    //         `#include <defaultnormal_vertex>
    //     pos = position;
    //     vUv = pos.xy;`);
      
    //      shader.fragmentShader = shader.fragmentShader.replace(
    //         `varying vec3 vViewPosition;`,
    //         `varying vec3 vViewPosition;
    //     varying vec3 pos;
    //     varying vec2 vUv;
      
    //     vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {
    //     vec3 vSigmaX = dFdx( surf_pos );
    //     vec3 vSigmaY = dFdy( surf_pos );
    //     vec3 vN = surf_norm;    // normalized
    //     vec3 R1 = cross( vSigmaY, vN );
    //     vec3 R2 = cross( vN, vSigmaX );
    //     float fDet = dot( vSigmaX, R1 );
    //     vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
    //     return normalize( abs( fDet ) * surf_norm - vGrad );
    //   }
      
    //   #define M_PI 3.1415926535897932384626433832795
    //   #define TAU 2. * M_PI
      
    //   float pattern(float v, float v2) {
    //     float offset = .4 * (sin(TAU*opacity));
    //     return smoothstep( .45 + offset, .55+offset, .5 + .5 * sin( 10. * 2. * M_PI * v + 10. * opacity * 2. * M_PI ) );
    //   }
    //   `);
      
    //      shader.fragmentShader = shader.fragmentShader.replace(
    //         `vec4 diffuseColor = vec4( diffuse, opacity );`,
    //         `vec4 diffuseColor = vec4( diffuse, opacity );
    //     float r = sqrt(pos.x*pos.x+pos.y*pos.y+pos.z*pos.z);
    //     float theta = acos(pos.z/r);
    //     float phi = atan(pos.y,pos.x);
    //     float strip = pattern(vUv.y, vUv.x);
    //     float stripOffset = pattern(vUv.y-.001, vUv.x)-strip;
    //     float modifiedRoughness = .2 + .3*strip;
    //     diffuseColor.rgb = vec3(.8*strip);`);
      
    //       shader.fragmentShader = shader.fragmentShader.replace(
    //         '#include <roughnessmap_fragment>',
    //         `#include <roughnessmap_fragment>
    //         roughnessFactor = modifiedRoughness;`
    //       );
      
    //       shader.fragmentShader = shader.fragmentShader.replace(
    //         '#include <normal_fragment>',
    //         `#include <normal_fragment>
    //         normal = perturbNormalArb( -vViewPosition, normal, vec2( 0., -stripOffset ) );`
    //       );
      
    //       shader.fragmentShader = `#extension GL_OES_standard_derivatives : enable
    //       ${shader.fragmentShader}`;
      
    //     }
        return material;
    }

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
        simulationFolder.add( c, 'rx', -3, Math.PI * 2, 0.05) 
        simulationFolder.add( c, 'ry', -3, Math.PI * 2, 0.05) 
        simulationFolder.add( c, 'rz', -3, Math.PI * 2, 0.05) 
        simulationFolder.add( c, 'speed', 0.01, 2, 0.01 )
        simulationFolder.add( c, 'numBlobs', 1, 100, 1 )
        simulationFolder.add( c, 'resolution', 10, 100, 1 )
        simulationFolder.add( c, 'isolation', 10, 300, 1 )
        simulationFolder.add( c, 'floor' )
        simulationFolder.add( c, 'wallx' )
        simulationFolder.add( c, 'wallz' )
        simulationFolder.open()

        // camera
        const cameraFolder = gui.addFolder( 'Camera' )
        cameraFolder.add( camera.position , 'x', 0, 1, 0.05 )
        cameraFolder.add( camera.position , 'y', -30, 10, 0.05 )
        cameraFolder.add( camera.position , 'z', 20, 150, 0.05 )
        cameraFolder.open()
    }
    
    // SCENE
    scene = new THREE.Scene()

    let resolution = 32; 

    material = getMaterial();
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

    const loopDuration = 8;

    const points = pointsOnSphere(c.numBlobs);
    console.log(points)
    const Maf_mix = function( x, y, a ) {
        if( a <= 0 ) return x;
        if( a >= 1 ) return y;
        return x + a * (y - x)
    };
    // this controls content of marching cubes voxel field
    function updateCubes( object, time, cohesion, strength, subtract, numBlobs ) {
        object.reset();
        // fill the field with some metaballs
        var i, ballx, bally, ballz, subtract, strength;
        for ( i = 0; i < numBlobs; i ++ ) {
            ballx = .5 + .35 * points[i].x;
            bally = .5 + .35 * points[i].y;
            ballz = .5 + .35 * points[i].z
            const c = .5 + .5 * Math.cos((cohesion+time + i/numBlobs) * Math.PI * 2); // const c = .5 + .5 * Math.cos((cohesion+time + i/numBlobs) * Maf.TAU);
            ballx = Maf_mix( .5, ballx, c );
            bally = Maf_mix( .5, bally, c );
            ballz = Maf_mix( .5, ballz, c );
            object.addBall(ballx, bally, ballz, strength, subtract);
        }
      }

    // LIGHTS
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(-1,1,1);
    directionalLight.castShadow = true;
    scene.add( directionalLight );

    const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight2.position.set(1,2,1);
    directionalLight2.castShadow = true;
    scene.add( directionalLight2 );

    const ambientLight = new THREE.AmbientLight(0x808080, .5);
    scene.add(ambientLight);

    const light = new THREE.HemisphereLight( 0xcefeff, 0xb3eaf0, .5 );
    scene.add( light );

    // ANIMATE
    const animate = (startTime) => {
        stats.begin() // XXX

        // ANIMATION
        const time = ( .001 * (performance.now()-startTime)) % loopDuration;
        const t = time / loopDuration;

        // marching cubes
        if (c.resolution !== resolution) {
            resolution = c.resolution;
            effect.init(Math.floor(resolution));
        }
        if (c.isolation !== effect.isolation) {
            effect.isolation = c.isolation;
        }
        const subtract = 12 - 10 * (.5 + .5 * Math.cos( t * 2 * Math.PI)); // 2 * Math.PI ==> Maf.TAU
        const strength = .5; //.5 / ( ( Math.sqrt( numBlobs ) - 1 ) / 4 + 1 );

        effect.rotation.set(c.rx, c.ry, c.rz)

        updateCubes( effect, t, .5 + .5 * Math.sin( t * 2 * Math.PI ), strength, subtract, c.numBlobs );
        effect.material.opacity = 1 * time / loopDuration;

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
}