import {Vector3, Matrix3} from '../../Libs/three.module.js';

function compute_hex_frames(map){
	let vertex2 = map.vertex2;
	let vertex = map.vertex;
	let volume = map.volume;

	let vertex2_frame = map.getAttribute(vertex2, "vertex2_frame");
	if(!vertex2_frame)
		vertex2_frame = map.addAttribute(vertex2, "vertex2_frame");

	let volume_frame = map.getAttribute(volume, "volume_frame");
	if(!volume_frame)
		volume_frame = map.addAttribute(volume, "volume_frame");

		let pos = map.getAttribute(vertex, "position");

	map.foreach(volume, wd => {
		if(map.isBoundary(wd))
			return;

		let D = [];
		D[0] = wd;
		D[1] = map.phi1[wd];
		D[2] = map.phi1[D[1]];
		D[3] = map.phi1[D[2]];
		D[4] = map.phi1[map.phi1[map.phi2[D[0]]]];
		D[5] = map.phi1[map.phi1[map.phi2[D[1]]]];
		D[6] = map.phi1[map.phi1[map.phi2[D[2]]]];
		D[7] = map.phi1[map.phi1[map.phi2[D[3]]]];
		let P = [];
		P[0] = pos[map.cell(vertex, D[0])];
		P[1] = pos[map.cell(vertex, D[1])];
		P[2] = pos[map.cell(vertex, D[2])];
		P[3] = pos[map.cell(vertex, D[3])];
		P[4] = pos[map.cell(vertex, D[4])];
		P[5] = pos[map.cell(vertex, D[5])];
		P[6] = pos[map.cell(vertex, D[6])];
		P[7] = pos[map.cell(vertex, D[7])];

		let U = new Vector3;
		let V = new Vector3;
		let W = new Vector3;

		U.add(P[0]).add(P[1]).add(P[2]).add(P[3]);
		U.sub(P[4]).sub(P[5]).sub(P[6]).sub(P[7]);
		U.multiplyScalar(0.25);
		V.add(P[0]).add(P[3]).add(P[4]).add(P[7]);
		V.sub(P[1]).sub(P[2]).sub(P[5]).sub(P[6]);
		V.multiplyScalar(0.25);
		W.add(P[0]).add(P[1]).add(P[4]).add(P[5]);
		W.sub(P[2]).sub(P[3]).sub(P[6]).sub(P[7]);
		W.multiplyScalar(0.25);
		volume_frame[map.cell(volume, wd)] = new Matrix3;
		volume_frame[map.cell(volume, wd)].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[1], P[0]); V.subVectors(P[4], P[0]); W.subVectors(P[3], P[0]);
		vertex2_frame[map.cell(vertex2, D[0])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[0])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[0], P[1]); V.subVectors(P[2], P[1]); W.subVectors(P[5], P[1]);
		vertex2_frame[map.cell(vertex2, D[1])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[1])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[1], P[2]); V.subVectors(P[3], P[2]); W.subVectors(P[6], P[2]);
		vertex2_frame[map.cell(vertex2, D[2])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[2])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[0], P[3]); V.subVectors(P[7], P[3]); W.subVectors(P[2], P[3]);
		vertex2_frame[map.cell(vertex2, D[3])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[3])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[0], P[4]); V.subVectors(P[5], P[4]); W.subVectors(P[7], P[4]);
		vertex2_frame[map.cell(vertex2, D[4])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[4])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[1], P[5]); V.subVectors(P[6], P[5]); W.subVectors(P[4], P[5]);
		vertex2_frame[map.cell(vertex2, D[5])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[5])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[2], P[6]); V.subVectors(P[7], P[6]); W.subVectors(P[5], P[6]);
		vertex2_frame[map.cell(vertex2, D[6])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[6])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		
		U.subVectors(P[3], P[7]); V.subVectors(P[4], P[7]); W.subVectors(P[6], P[7]);
		vertex2_frame[map.cell(vertex2, D[7])] = new Matrix3;
		vertex2_frame[map.cell(vertex2, D[7])].set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);

	});

	return {vertex2_frame, volume_frame};
}

export default function compute_scaled_jacobian(map){
	let vertex2 = map.vertex2;
	let volume = map.volume;

	let vertex2_frame = map.getAttribute(vertex2, "vertex2_frame");
	let volume_frame = map.getAttribute(volume, "volume_frame");

	if(!vertex2_frame){
		let frames = compute_hex_frames(map);
		vertex2_frame = frames.vertex2_frame;
		volume_frame = frames.volume_frame;
	}

	let scaled_jacobian = map.getAttribute(volume, "scaled_jacobian");
	if(!scaled_jacobian)
		scaled_jacobian = map.addAttribute(volume, "scaled_jacobian");

	let F = new Matrix3;
	let U = new Vector3;
	let V = new Vector3;
	let W = new Vector3;
	map.foreach(volume, wd => {
		if(map.isBoundary(wd))
			return;
			
		F.copy(volume_frame[map.cell(volume, wd)]);
		F.extractBasis(U, V, W);
		U.normalize(); V.normalize(); W.normalize();
		F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
		let sj = F.determinant();

		map.foreachIncident(vertex2, volume, wd, v2d => {
			F.copy(vertex2_frame[map.cell(vertex2, v2d)]);
			F.extractBasis(U, V, W);
			U.normalize(); V.normalize(); W.normalize();
			F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
			let det = F.determinant();
			sj = (det < sj ? det : sj);
		});

		scaled_jacobian[map.cell(volume, wd)] = sj;
	});

	return scaled_jacobian;
}

export function computeHexScaledJacobian(P){
	let U = new Vector3;
	let V = new Vector3;
	let W = new Vector3;
	let F = new Matrix3;

	let jacobian = Infinity;

	U.sub(P[0]).sub(P[1]).sub(P[2]).sub(P[3]);
	U.add(P[4]).add(P[5]).add(P[6]).add(P[7]);
	
	V.sub(P[0]).sub(P[3]).sub(P[4]).sub(P[7]);
	V.add(P[1]).add(P[2]).add(P[5]).add(P[6]);

	W.sub(P[0]).sub(P[1]).sub(P[4]).sub(P[5]);
	W.add(P[2]).add(P[3]).add(P[6]).add(P[7]);

	U.normalize(); V.normalize(); W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	let sj = F.determinant();

	if(sj < jacobian) jacobian = sj;

	U.subVectors(P[1], P[0]); V.subVectors(P[3], P[0]); W.subVectors(P[4], P[0]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;

	U.subVectors(P[0], P[1]); V.subVectors(P[5], P[1]); W.subVectors(P[2], P[1]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;

	U.subVectors(P[1], P[2]); V.subVectors(P[6], P[2]); W.subVectors(P[3], P[2]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;

	U.subVectors(P[0], P[3]); V.subVectors(P[2], P[3]); W.subVectors(P[7], P[3]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;

	U.subVectors(P[0], P[4]); V.subVectors(P[7], P[4]); W.subVectors(P[5], P[4]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;

	U.subVectors(P[1], P[5]); V.subVectors(P[4], P[5]); W.subVectors(P[6], P[5]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;
	
	U.subVectors(P[2], P[6]); V.subVectors(P[5], P[6]); W.subVectors(P[7], P[6]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;
	
	U.subVectors(P[3], P[7]); V.subVectors(P[6], P[7]); W.subVectors(P[4], P[7]);
	U.normalize();V.normalize();W.normalize();
	F.set(U.x, V.x, W.x, U.y, V.y, W.y, U.z, V.z, W.z);
	sj = F.determinant();
	if(sj < jacobian) jacobian = sj;

	return jacobian;
}

