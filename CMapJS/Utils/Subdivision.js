export function cutAllEdges(cmap, func){
	let edgeCache = cmap.cache(cmap.edge);

	cmap.foreach(cmap.edge, ed => {
		func(cmap.cutEdge(ed, true));
	}, {cache: edgeCache});
}

/// edges already cut
export function quadrangulateFace(cmap, fd){
	let d0 = cmap.phi1[fd];
	let d1 = cmap.phi1[cmap.phi1[d0]];
	let ed = cmap.cutFace(d0, d1);
	let vd = cmap.cutEdge(ed);

	d0 = cmap.phi1[fd];
	d1 = cmap.phi1[cmap.phi1[d1]];
	do
	{
		cmap.cutFace(cmap.phi1[d0], d1);
		d1 = cmap.phi1[cmap.phi1[d1]];
	} while(d1 != d0);

	return vd;
}

export function quadrangulateAllFaces(cmap, edgeCutFunc, faceCutFunc){
	let faceCache = cmap.cache(cmap.face);
	cutAllEdges(cmap, edgeCutFunc);
	cmap.foreach(cmap.face, fd => {
		faceCutFunc(quadrangulateFace(cmap, fd));
	}, {cache: faceCache});
}

export function triangulateFace(cmap, fd){
	let d1 = cmap.phi1[fd];
	cmap.cutFace(fd, d1);
	cmap.cutEdge(cmap.phi_1[fd]);

	let d0 = cmap.phi2[cmap.phi_1[fd]];
	d1 = cmap.phi1[cmap.phi1[cmap.phi1[d0]]];
	let next;
	while(d1 != d0){
		next = cmap.phi1[d1];
		cmap.cutFace(d1, cmap.phi1[d0]);
		d1 = next;
	}

	return cmap.phi_1[fd];
}

export function triangulateAllFaces(cmap, func){
	let faceCache = cmap.cache(cmap.face);
	cmap.foreach(cmap.face, fd => {
		func(triangulateFace(cmap, fd));
	}, {cache: faceCache});
}