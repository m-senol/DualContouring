import Renderer from './CMapJS/Rendering/Renderer.js';
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';
import {mapFromGeometry as mapFromGeometry_3d} from '../CMapJS/IO/Volumes_Formats/CMap3IO.js'
//import {mapFromGeometry as mapFromGeometry_2d} from '../CMapJS/IO/Surface_Formats/CMap2IO.js'
import {dual_contouring as dual_contouring_3d} from './dc_3d.js'
//import {dual_contouring as dual_contouring_2d} from './dc_2d.js'

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


// Fonctions 3D
function sphere(x, y, z)
{
    return x*x + y*y + z*z - 27;

}

function tore(x, y, z)
{
    return (Math.sqrt(x*x + y*y)-8)*(Math.sqrt(x*x + y*y)-7) + z*z - 5;
}

function singul(x, y, z)
{
    return Math.pow(x, 4)-5*Math.pow(x, 2)+Math.pow(y, 4)-5*Math.pow(y, 2)+Math.pow(z, 4)-5*Math.pow(z, 2)+8.000000000000001;
}

// Fonctions 2D
function cercle(x, y)
{
    return x*x + y*y - 27;
}

var r;
var map;
var rend;
var courant = 0;
var ancienne = -1;
var dimension = -1;
/// Page Loop
function update ()
{
    if(courant != ancienne)
    {
        if(courant == 0)
        {
            r = dual_contouring_3d(sphere);
            map = mapFromGeometry_3d({v: r[0], quad: [], hex:r[1]});
            
            if(dimension == 3)
            {
                rend.volumes.remove();
            }
            else if(dimension == 2)
            {
                rend.faces.remove();
                rend.edges.remove();
                rend.vertices.remove();
            }

            rend = new Renderer(map);
            rend.volumes.create();
            rend.volumes.addTo(scene);
            rend.volumes.rescale(0.9);
            dimension = 3;
        }
        else if(courant == 1)
        {
            r = dual_contouring_3d(tore);
            map = mapFromGeometry_3d({v: r[0], quad: [], hex:r[1]});
            
            if(dimension == 3)
            {
                rend.volumes.remove();
            }
            else if(dimension == 2)
            {
                rend.faces.remove();
                rend.edges.remove();
                rend.vertices.remove();
            }

            rend = new Renderer(map);
            rend.volumes.create();
            rend.volumes.addTo(scene);
            rend.volumes.rescale(0.9);

            dimension = 3;
        }
        else if(courant == 2)
        {
            r = dual_contouring_3d(singul);
            map = mapFromGeometry_3d({v: r[0], quad: [], hex:r[1]});
            
            if(dimension == 3)
            {
                rend.volumes.remove();
            }
            else if(dimension == 2)
            {
                rend.faces.remove();
                rend.edges.remove();
                rend.vertices.remove();
            }

            rend = new Renderer(map);
            rend.volumes.create();
            rend.volumes.addTo(scene);
            rend.volumes.rescale(0.9);
            dimension = 3;
        }
        ancienne = courant;
    }
}

function render()
{
	renderer.render(scene, camera);
}

function mainloop()
{
    document.addEventListener("keydown", event => {
        if (event.isComposing || event.key === 229) {
          return;
        }
        if(courant != 0 && event.key === 'a'){
            courant = 0;
        }
        if(courant != 1 && event.key === 's'){
            courant = 1;
        }
        if(courant != 2 && event.key === 'd'){
            courant = 2;
        }

    });
    update();
    render();
    requestAnimationFrame(mainloop);
}

mainloop();
