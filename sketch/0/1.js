import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
//const hdrTextureURL = new URL('img/studio_small_08_8k.hdr', import.meta.URL);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//background color
renderer.setClearColor(0x00ff00);
//scena e camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 5);
orbit.update();
/*const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);
// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);*/
//const loader = new RGBELoader();
//loader.load(hdrTextureURL, function(texture){
//texture.mapping = THREE.EquirectangularReflectionMapping;
    //scene.background = texture;
    //scene.environment = texture;
    //sfera lucida
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 50, 50),
        new THREE.MeshPhysicalMaterial({
            roughness: 0,
            metalness: 1,
            color: 0xFEFEFE
           // transmission: 1,
            //ior: 2.33
        })
    );
    scene.add(sphere);
    sphere.position.x = 1.5;
   //sfera opaca
   const sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(1, 50, 50),
        new THREE.MeshPhysicalMaterial({
            roughness: 0.6,
            metalness: 0,
            color: 0xFEFEFE
            //envMap: texture
        })
    );
    scene.add(sphere2);
    sphere2.position.x = -1.5;
//})
//animazione sfera
function animate() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});