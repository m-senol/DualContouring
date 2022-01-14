import {CMap2} from '../../CMap/CMap.js';
import {Vector3} from '../../Libs/three.module.js';
import {loadOff, exportOff} from './Off.js';

export function loadCMap2(format, fileStr){
	let geometry = geometryFromStr(format, fileStr);
	let map = mapFromGeometry(geometry);
	console.log("loaded file: " + format + " (v:" + geometry.v.length + ", f:" + geometry.f.length + ")");
	return map;
}

export function geometryFromStr(format, fileStr){
	let geometry;
	switch(format){
		case 'off':
			geometry = loadOff(fileStr);
			break;
		default:
			break;
	}
	return geometry;
}

export function mapFromGeometry(geometry){
	let map = new CMap2;
	let position = map.addAttribute(map.vertex, "position");
	let dartPerVertex = map.addAttribute(map.vertex, "dartPerVertex");

	// let mid = new Vector3(-0.7710000000000008, 0.8262499999999999, 0.2458000000000009);
	// let str = "";
	// let axisX = new Vector3(1, 0 ,0);
	// let axisY = new Vector3(0, 1 ,0);
	// let axisZ = new Vector3(0, 0,1);

	let vertexIds = [];
	geometry.v.forEach(vertex => {
		let i = map.newCell(map.vertex);
		vertexIds.push(i);
		dartPerVertex[i] = [];
		position[i] = new Vector3(vertex[0], vertex[1], vertex[2]);

		// let p = new Vector3(vertex[0], vertex[1], vertex[2]);
		// p.sub(mid)
		// p.divideScalar(57);
		// p.applyAxisAngle(axisY, Math.PI)
		// .applyAxisAngle(axisY, Math.PI / 2);
		// str += p.x.toFixed(6) + " " + p.y.toFixed(6) + " " + p.z.toFixed(6) + "\n";
	});

	// console.log(str);

	map.setEmbeddings(map.vertex);
	geometry.f.forEach(face => {
		let d = map.addFace(face.length, false);
		for(let i = 0; i < face.length; i++){
			map.setEmbedding(map.vertex, d, face[i]);
			dartPerVertex[face[i]].push(d);
			d = map.phi1[d];
		}
	});

	let v0 = -1;
	map.foreachDart(d0 => {
		v0 = map.cell(map.vertex, d0);
		dartPerVertex[map.cell(map.vertex, map.phi1[d0])].forEach(d1 => {
			if(map.cell(map.vertex, map.phi1[d1]) == v0){
				map.sewPhi2(d0, d1);
			}
		});
	});

	map.close(true);
	dartPerVertex.delete();

	return map;
}

export function exportCmap2(map, format){
	let geometry = geometryFromMap(map);
	console.log(geometry);
	let str = strFromGeometry(format, geometry);
	return str;
}

function strFromGeometry(format, geometry){
	let fileStr;
	switch(format){
		case 'off':
			fileStr = exportOff(geometry);
			break;
		default:
			break;
	}
	return fileStr;
}

function geometryFromMap(map){
	let geometry = {v: [], e: [], f: []};
	const vertex = map.vertex;
	const edge = map.edge;
	const face = map.face;

	const position = map.getAttribute(vertex, "position");
	const vertexId = map.addAttribute(vertex, "id");

	let id = 0;
	map.foreach(vertex, vd => {
		vertexId[map.cell(vertex, vd)] = id++;
		const p = position[map.cell(vertex, vd)];
		geometry.v.push([p.x, p.y, p.z]);
	});

	map.foreach(face, fd => {
		let f = [];
		map.foreachDartOf(face, fd, d => {
			f.push(vertexId[map.cell(vertex, d)]);
		});
		geometry.f.push(f);
	});

	vertexId.delete();

	return geometry;
}