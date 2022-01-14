import {triangulateAllFaces} from '../../../Utils/Subdivision.js';
import {Vector3} from '../../../Libs/three.module.js';

export function sqrt2(cmap){
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
		pos[vid].divideScalar(degree);
	});

	let n, vid;
	let sum_Q = new Vector3;
	cmap.foreach(vertex, vd => {
		sum_Q.set(0,0,0);
		n = 0;
		vid = cmap.cell(vertex, vd);
		cmap.foreachDartOf(vertex, vd, d => {
			sum_Q.add(pos[cmap.cell(vertex, cmap.phi2[cmap.phi1[d]])]);
			++n;
		});
		sum_Q.divideScalar(2 * n);

		delta[vid] = new Vector3;
		delta[vid].addScaledVector(pos[vid], -0.5);
		delta[vid].add(sum_Q);
	}, {cache: vertexCache});

	cmap.foreach(vertex, vd => {
		vid = cmap.cell(vertex, vd);
		pos[vid].add(delta[vid]);
	}, {cache: vertexCache});

	cmap.foreach(edge, ed => {
		cmap.mergeFaces(ed);
	}, {cache: edgeCache});

	delta.delete();
}