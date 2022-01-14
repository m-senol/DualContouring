import {CMap3, CMap2} from '../../CMap/CMap.js';
import {Vector3} from '../../Libs/three.module.js';
import {loadMesh, exportMesh} from './Mesh.js';

export function loadCmap3(format, fileStr){
	let geometry = geometryFromStr(format, fileStr);
	let map = mapFromGeometry(geometry);
	console.log("loaded file: " + format + " (v:" + geometry.v.length + ", w:" + geometry.hex.length + ")");
	return map;
}

export function geometryFromStr(format, fileStr){
	let geometry;
	switch(format){
		case 'mesh':
			geometry = loadMesh(fileStr);
			break;
		default:
			break;
	}
	return geometry;
}

export function mapFromGeometry(geometry){
	let map = new CMap3;
	const vertex = map.vertex;
	const vertex2 = map.vertex2;
	const face2 = map.face2;

	let position = map.addAttribute(vertex, "position");
	let dartPerVertex = map.addAttribute(vertex, "dartPerVertex");

	let vertexIds = [];
	geometry.v.forEach(vert => {
		let i = map.newCell(vertex);
		vertexIds.push(i);
		dartPerVertex[i] = [];
		position[i] = new Vector3(vert[0], vert[1], vert[2]);

	});

	map.createEmbedding(vertex);

	if(geometry.tet)
		geometry.tet.forEach(tet => {

		});

	if(geometry.hex)
		geometry.hex.forEach(hex => {
			let d0 = map.addPrism(4, false);
			let d1 = map.phi2[map.phi1[map.phi1[map.phi2[d0]]]];
			let darts_of_hex = [
				d0,
				map.phi_1[d0],
				map.phi1[map.phi1[d0]],
				map.phi1[d0],
				map.phi1[d1],
				map.phi1[map.phi1[d1]],
				map.phi_1[d1],
				d1
			];

			for(let i = 0; i < hex.length; ++i){
				map.foreachDartOf(vertex2, darts_of_hex[i], vd2 => {
					map.setEmbedding(map.vertex, vd2, hex[i]);
					dartPerVertex[hex[i]].push(vd2);
				});
			}
		});

	if(geometry.vol)
		geometry.vol.forEach(vol => {

		});
	
	let marker = map.newMarker();
	let open_map = false;
	map.foreachDart(d0 => {
		if(map.phi3[d0] == d0 && !marker.marked(d0)){
			map.foreachDartOf(map.face2, d0, d1 => {
				marker.mark(d1)
			});

			let target_d;
			let d1 = d0;
			do {
				let vid0 = map.cell(vertex, d1);
				let vid1 = map.cell(vertex, map.phi1[map.phi1[d1]]);
				let v_darts = dartPerVertex[map.cell(vertex, map.phi1[d1])];
				v_darts.forEach(d => {
					if(map.cell(vertex, map.phi1[d]) == vid0 && map.cell(vertex, map.phi_1[d]) == vid1){
						target_d = d;
						// return true;
					}
				});
				d1 = map.phi1[d1];
			} while(target_d == undefined && d1 != d0);

			if(target_d != undefined){
				d1 = map.phi_1[d1];
				let d2 = target_d;
				do {
					d1 = map.phi1[d1];
					d2 = map.phi_1[d2];
					map.sewPhi3(d1, d2);
				} while(d1 != d0);

			}
			open_map |= (target_d != undefined);
		}
	});
	marker.remove();
	
	// if(open_map)
		map.close();

	dartPerVertex.delete();

	return map;
}