import {cutAllEdges} from '../../../Utils/Subdivision.js';
import {Vector3} from '../../../Libs/three.module.js';

export function butterfly(cmap){
	const vertex = cmap.vertex;
	const edge = cmap.edge;
	const face = cmap.face;
	const pos = cmap.getAttribute(vertex, "position");

	let vertexCache = cmap.cache(vertex);
	let edgeCache = cmap.cache(edge);
	let faceCache = cmap.cache(face);

	let edgeMidCache = [];
	cutAllEdges(cmap, vd => {
		edgeMidCache.push(vd);
		pos[cmap.cell(vertex, vd)] = new Vector3;
	});

	let d;
	cmap.foreach(vertex, vd => {
		d = cmap.phi2[vd];
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], 0.5);
		d = cmap.phi1[cmap.phi1[d]];
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], 0.5);
		d = cmap.phi1[cmap.phi1[d]]
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], 2 / 16);
		d = cmap.phi2[cmap.phi1[cmap.phi1[vd]]]
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], 2 / 16);
		d = cmap.phi_1[cmap.phi_1[d]]
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], -1 / 16);
		d = cmap.phi_1[cmap.phi_1[cmap.phi2[cmap.phi_1[cmap.phi2[vd]]]]]
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], -1 / 16);
		d = cmap.phi1[cmap.phi1[cmap.phi1[cmap.phi2[cmap.phi1[cmap.phi1[cmap.phi2[vd]]]]]]]
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], -1 / 16);
		d = cmap.phi1[cmap.phi1[cmap.phi1[cmap.phi2[cmap.phi1[cmap.phi1[cmap.phi1[vd]]]]]]]
		pos[cmap.cell(vertex, vd)].addScaledVector(pos[cmap.cell(vertex, d)], -1 / 16);
		
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
};