import {cutAllEdges} from '../../../Utils/Subdivision.js';
import {Vector3} from '../../../Libs/three.module.js';

function beta(n){
	return n == 3? 3/16 : 3/(8*n);
}

export function loop(cmap){
	const vertex = cmap.vertex;
	const edge = cmap.edge;
	const face = cmap.face;
	const pos = cmap.getAttribute(vertex, "position");
	const new_pos = cmap.addAttribute(vertex, "new_pos");

	let faceCache = cmap.cache(face);

	cmap.foreach(vertex, vd => {
		let degree = 0;
		let vid = cmap.cell(vertex, vd);
		new_pos[vid] = new Vector3;
		cmap.foreachDartOf(vertex, vd, d => {
			++degree;
			new_pos[vid].add(pos[cmap.cell(vertex, cmap.phi2[d])]);
		});
		let b = beta(degree);
		new_pos[vid].multiplyScalar(b);
		new_pos[vid].addScaledVector(pos[cmap.cell(vertex, vd)], 1 - degree *b);
	});

	let edgeMidCache = [];
	cutAllEdges(cmap, vd => {
		edgeMidCache.push(vd);
		new_pos[cmap.cell(vertex, vd)] = new Vector3;
	});

	let d;
	cmap.foreach(vertex, vd => {
		d = cmap.phi1[vd];
		new_pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], 3)
		d = cmap.phi1[cmap.phi1[d]];
		new_pos[cmap.cell(vertex, vd)].add(pos[cmap.cell(vertex, d)])
		d = cmap.phi1[cmap.phi2[cmap.phi_1[vd]]];
		new_pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], 3)
		d = cmap.phi1[cmap.phi1[d]];
		new_pos[cmap.cell(vertex, vd)].add(pos[cmap.cell(vertex, d)])
		new_pos[cmap.cell(vertex, vd)].divideScalar(8);
	}, {cache: edgeMidCache});

	let d0, d1;
	cmap.foreach(face, fd => {
		d0 = cmap.phi1[fd];
		d1 = cmap.phi1[cmap.phi1[d0]];
		cmap.cutFace(d0, d1);

		d0 = d1;
		d1 = cmap.phi1[cmap.phi1[d0]];
		cmap.cutFace(d0, d1);
		
		d0 = d1;
		d1 = cmap.phi1[cmap.phi1[d0]];
		cmap.cutFace(d0, d1);
	}, {cache: faceCache});

	cmap.foreach(vertex, vd => {
		pos[cmap.cell(vertex, vd)] = new_pos[cmap.cell(vertex, vd)];
	});
	new_pos.delete();
};