import {Vector3} from '../../../Libs/three.module.js';

export function dooSabin(cmap){
	const vertex = cmap.vertex;
	const edge = cmap.edge;
	const face = cmap.face;

	const pos = cmap.getAttribute(vertex, "position");
	const delta = cmap.addAttribute(vertex, "delta");


	let vertexMarker = cmap.newMarker();
	let edgeMarker = cmap.newMarker();
	let edgeCache = cmap.cache(edge);
	let faceCache = cmap.cache(face);
	let holes = [];
	let corners = [];

	/// marking one to keep index
	cmap.foreach(vertex, vd => {
		vertexMarker.mark(vd);
	}, {useEmb: true});

	let ed1, efd;
	cmap.foreach(edge, ed0 => {
		edgeMarker.mark(ed0);
		ed1 = cmap.phi2[ed0];
		cmap.unsewPhi2(ed0);
		efd = cmap.addFace(4, false);
		cmap.sewPhi2(ed0, efd);
		cmap.sewPhi2(ed1, cmap.phi1[cmap.phi1[efd]]);
		holes.push(cmap.phi1[efd]);
		holes.push(cmap.phi_1[efd]);

	}, {cache: edgeCache});

	for(let i = 0; i < holes.length; ++i){
		if(holes[i] != cmap.phi2[holes[i]])
			continue; 

		cmap.closeHole(holes[i], false, false);
	}	

	let point;
	let vid;
	cmap.foreach(face, fd => {
		cmap.foreachDartOf(face, fd, vd => {
			vid = cmap.cell(vertex, vd);
			if(!vertexMarker.marked(vd)){
				point = pos[vid].clone();
				vid = cmap.newCell(vertex);
				cmap.setEmbedding(vertex, vd, vid);
				pos[vid] = point;
			}
			cmap.foreachDartOf(vertex, vd, d => {
				cmap.setEmbedding(vertex, d, vid);
			});
		});
	}, {cache: faceCache});

	let barycenter = new Vector3;
	let nbVertices;
	cmap.foreach(face, fd => {
		barycenter.set(0, 0, 0);
		nbVertices = 0;
		cmap.foreachDartOf(face, fd, d => {
			++nbVertices;
			barycenter.add(pos[cmap.cell(vertex, d)])
			delta[cmap.cell(vertex, d)] = pos[cmap.cell(vertex, d)]
				.clone()
				.multiplyScalar(-2)
				.addScaledVector(pos[cmap.cell(vertex, cmap.phi1[d])], 0.5)
				.addScaledVector(pos[cmap.cell(vertex, cmap.phi_1[d])], 0.5);
		});
		barycenter.divideScalar(nbVertices);

		cmap.foreachDartOf(face, fd, d => {
			delta[cmap.cell(vertex, d)].add(barycenter).divideScalar(4)
			pos[cmap.cell(vertex, d)].add(delta[cmap.cell(vertex, d)]);
		});


	}, {cache: faceCache});

	
}