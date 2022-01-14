import * as THREE from '../Libs/three.module.js';
import {RendererCellProto} from './Renderer.js';
import Renderer from './Renderer.js';

function slerp(A, B, alpha, out = false)
{
	let sl = new THREE.Vector3();
	let phi = A.angleTo(B);
	if(out) phi = phi - 2*Math.PI;
	let s0 = Math.sin(phi*(1-alpha));
	let s1 = Math.sin(phi*alpha);
	let s2 = Math.sin(phi);
	sl.addScaledVector(A, s0 / s2);
	sl.addScaledVector(B, s1 / s2);
	return sl;
}

function newGeodesic(A, B, nb_divs = 200, out = false)
{
	let geodesic = [];
	let phi = A.angleTo(B);
	if(out) phi -= 2*Math.PI;
	let s2 = Math.sin(phi);
	let s0 = 0;
	let s1 = 0;
	let alpha = 0;
	for(let i = 0; i <= nb_divs; i++)
	{
		let p = new THREE.Vector3();
		alpha = i / nb_divs;
		s0 = Math.sin(phi*(1-alpha));
		s1 = Math.sin(phi*alpha);
		p.addScaledVector(A, s0 / s2);
		p.addScaledVector(B, s1 / s2);
		geodesic.push(p);
	}
	return geodesic;
}

function subdivideTriangle(A, B, C, divs)
{
	if(divs < 2) 
		return [A, B, C];

	let vertices = [];
	for(let i = 0; i <= divs; ++i)
	{
		let ab = slerp(A, B, i / divs);
		let ac = slerp(A, C, i / divs);
		if(i == 0)
			vertices.push(ab);
		else
			for(let j = 0; j <= i; ++j)
				vertices.push(slerp(ab, ac, j / i));
	}

	return vertices;
}


export default function RendererSpherical(cmap){
	Renderer.call(this, cmap);
	const position = cmap.getAttribute(cmap.vertex, "position");

	let vertex = cmap.vertex;
	let edge = cmap.edge;
	this.geodesics = (!edge) ? undefined : Object.assign(Object.create(RendererCellProto), {
		create: function(params = {}){
			this.params = params;
			const geometry = new THREE.Geometry();
			cmap.foreach(edge, ed => {
				let geodesic = newGeodesic(
					position[cmap.cell(vertex, ed)],
					position[cmap.cell(vertex, cmap.phi1[ed])]
				);
				for(let i = 1; i < geodesic.length; ++i){
					geometry.vertices.push(geodesic[i - 1], geodesic[i]);
				}
				
			}, {useEmb: cmap.isEmbedded(edge)});

			const material = params.material || new THREE.LineBasicMaterial({
				color: params.color || 0x000000,
				linewidth: params.width || 2,
				polygonOffset: true,
				polygonOffsetFactor: -0.5
			});

			this.mesh = new THREE.LineSegments(geometry, material);
			this.mesh.layers.set(params.layer || 0);
			return this;
		}
	});

	let face = cmap.face;
	this.curvedFaces = (!face) ? undefined : true;
}