import {Vector3} from '../../Libs/three.module.js';

export function vertex_normal(map, vd, position){
	let vertex_normal = new Vector3;
	
	return vertex_normal;
};

export function face_normal(map, fd, position){
	let face_normal = new Vector3;
	let center = new Vector3;
	let degree = 0;

	map.foreachIncident(map.vertex, map.face, fd, vd => {
		++degree;
		center.add(position[map.cell(map.vertex, vd)]);
	});
	center.divideScalar(degree);

	let normal = new Vector3;
	let v0 = new Vector3;
	let v1 = new Vector3;
	map.foreachIncident(map.vertex, map.face, fd, vd0 => {
		v0.subVectors(position[map.cell(map.vertex, vd0)], center);
		v0.normalize();
		v1.subVectors(position[map.cell(map.vertex, map.phi1[vd0])], center);
		v1.normalize();
		normal.crossVectors(v0, v1).normalize();
		face_normal.add(normal);
	});
	face_normal.divideScalar(degree);

	return face_normal;
};

export function computeFace_normals(map, position, face_normals){
	console.log(map, position, face_normals)
	const normals = face_normals ? 
		face_normals : map.addAttribute(map.face, "face_normals");
	
	map.foreach(map.face, fd => {
		normals[map.cell(map.face, fd)] = face_normal(map, fd, position);
	});

	return normals;
};

export function vertex_normals(map, attributes){

}
