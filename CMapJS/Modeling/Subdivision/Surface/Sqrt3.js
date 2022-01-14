import {triangulateAllFaces} from '../../../Utils/Subdivision.js';
import {Vector3} from '../../../Libs/three.module.js';

function alpha(n){
	let alph = 4.0;
	alph -= 2.0 * Math.cos(2.0 * Math.PI / n);
	alph /= 9.0;
	return alph;
}

export function sqrt3(cmap){
	const vertex = cmap.vertex;
	const edge = cmap.edge;
	const pos = cmap.getAttribute(vertex, "position");
	const delta = cmap.addAttribute(vertex, "delta");

	let edgeCache = cmap.cache(edge);
	let vertexCache = cmap.cache(vertex);

	triangulateAllFaces(cmap, vd => {
		let degree = 0;
		let vid = cmap.cell(vertex, vd);
		pos[vid] = new Vector3;
		cmap.foreachDartOf(vertex, vd, d => {
			++degree;
			pos[vid].add(pos[cmap.cell(vertex, cmap.phi2[d])]);
		});
		pos[vid].multiplyScalar(1 / degree);
	});

	cmap.foreach(edge, ed => {
		cmap.flipEdge(ed);
	}, {cache: edgeCache});

	let vd1, n, vid;
	let sum_Q = new Vector3;
	cmap.foreach(vertex, vd0 => {
		sum_Q.set(0,0,0);
		n = 0;
		vd1 = cmap.phi_1[vd0];
		vid = cmap.cell(vertex, vd1);
		cmap.foreachDartOf(vertex, vd1, d => {
			sum_Q.add(pos[cmap.cell(vertex, cmap.phi2[cmap.phi1[cmap.phi2[cmap.phi1[d]]]])]);
			++n;
		});
		sum_Q.divideScalar(n);
		let alph = alpha(n);
		delta[vid] = new Vector3;
		delta[vid].addScaledVector(pos[vid], -alph);
		delta[vid].addScaledVector(sum_Q, alph);
	}, {cache: vertexCache});

	cmap.foreach(vertex, vd0 => {
		vd1 = cmap.phi_1[vd0];
		vid = cmap.cell(vertex, vd1);
		pos[vid].add(delta[vid]);
	}, {cache: vertexCache});

	delta.delete();
}