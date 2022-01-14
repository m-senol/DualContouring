import {Graph} from '../../CMap/CMap.js';
import {Vector3} from '../../Libs/three.module.js';
import {loadCg, saveCg} from './Cg.js';

export function loadGraph(format, fileStr){
	let geometry = geometryFromStr(format, fileStr);
	let graph = graphFromGeometry(geometry);
	console.log("loaded file: " + format + " (v:" + geometry.v.length + ", e:" + geometry.e.length + ")");
	return graph;
}

function geometryFromStr(format, fileStr){
	let geometry;
	switch(format){
		case 'cg':
			geometry = loadCg(fileStr);
			break;
		default:
			break;
	}
	return geometry;
}

function graphFromGeometry(geometry){
	let graph = new Graph;
	const vertex = graph.vertex;

	graph.createEmbedding(vertex);
	const position = graph.addAttribute(vertex, "position");

	const vertexIds = [];
	geometry.v.forEach(v3 => {
		let vd = graph.addVertex(true);
		vertexIds.push(vd);
		position[graph.cell(vertex, vd)] = new Vector3(v3[0], v3[1], v3[2]);
	});

	geometry.e.forEach(e => {
		graph.connectVertices(vertexIds[e[0]], vertexIds[e[1]]);
	});

	return graph;
}

export function exportGraph(graph, format){
	let geometry = geometryFromGraph(graph);
	console.log(geometry);
	let str = strFromGeometry(format, geometry);
	return str;
}

function strFromGeometry(format, geometry){
	let fileStr;
	switch(format){
		case 'cg':
			// fileStr = export_cg(geometry);
			break;
		default:
			break;
	}
	return geometry;
}

function geometryFromGraph(graph){
	let geometry = {v: [], e: [], f: []};
	const vertex = graph.vertex;
	const edge = graph.edge;
	const face = graph.face;

	const position = graph.getAttribute(vertex, "position");
	const vertexId = graph.addAttribute(vertex, "id");

	let id = 0;
	graph.foreach(vertex, vd => {
		vertexId[graph.cell(vertex, vd)] = id++;
		const p = position[graph.cell(vertex, vd)];
		geometry.v.push(p.x, p.y, p.z);
	});

	// graph.foreach(edge, ed => {
	// 	graph.foreachDartOf(edge, ed, d => {

	// 	});
	// });

	graph.foreach(face, fd => {
		let f = [];
		graph.foreachDartOf(face, fd, d => {
			f.push(vertexId[graph.cell(vertex, d)]);
		});
		geometry.f.push(f);
	});

	vertexId.delete();

	return geometry;
}