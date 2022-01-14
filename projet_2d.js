import Renderer from './CMapJS/Rendering/Renderer.js';
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';

/// Set up - ThreeJS Scene, camera, and controls
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xAAAAAA);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000.0);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const orbit_controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

let ambientLight = new THREE.AmbientLight(0xAAAAFF, 0.5);
scene.add(ambientLight);
let pointLight0 = new THREE.PointLight(0x3137DD, 5);
pointLight0.position.set(15,8,5);
scene.add(pointLight0);


/* <WRITE HERE> */

function f(x, y)
{
    return x*x + y*y - 27;
}

let r = dual_contouring(f);
let map = mapFromGeometry({v:r[0], f:r[1]});

/* </WRITE HERE> */


/// You can use .debug to check your map topology 
map.debug();

/// Create Renderer
let rend = new Renderer(map);
rend.faces.create();
rend.faces.addTo(scene);
rend.edges.create();
rend.edges.addTo(scene);
rend.vertices.create();
rend.vertices.addTo(scene);


/// Page Loop
function update ()
{

}

function render()
{
	renderer.render(scene, camera);
}

function mainloop()
{
    update();
    render();
    requestAnimationFrame(mainloop);
}

mainloop();
