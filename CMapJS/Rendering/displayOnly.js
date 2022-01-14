import {geometryFromStr as surfaceGeometryFromStr} from '../IO/Surface_Formats/CMap2IO.js';
import {geometryFromStr as volumesGeometryFromStr} from '../IO/Volumes_Formats/CMap3IO.js';
import {computeHexScaledJacobian} from '../Modeling/Quality/ScaledJacobians.js';
import * as THREE from '../Libs/three.module.js';

const meshColor = new THREE.Color(0x60c3f4);

let v_shader = `
in vec3 position;

in vec3 center;
in vec3 v0;
in vec3 v1;
in vec3 v2;
in vec3 v3;
in vec3 v4;
in vec3 v5;
in vec3 v6;
in vec3 v7;
in vec3 quality_color;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPos;
uniform int clipping;
uniform float min_clipping;
uniform float max_clipping;
uniform int quality;
uniform vec3 mesh_color;
uniform float max_scale;

out vec3 pos;
out vec3 col;

void main() {
	vec3 p = position; // useless but firefox needs it
	switch(gl_VertexID){
		case 0: p = v0; break;
		case 1: p = v1; break;
		case 2: p = v2; break;
		case 3: p = v3; break; 
		case 4: p = v4; break;
		case 5: p = v5; break;
		case 6: p = v6; break;
		case 7: p = v7; break;
	}

	vec3 plane = normalize(vec3(-1, 0, -2));
	float scale = max_scale;

	vec3 c = vec3(modelMatrix * vec4(center, 1.0));
	float value = dot(plane, vec3(modelMatrix * vec4(center , 1.0)));
	value = clamp((value - min_clipping)/(max_clipping - min_clipping), 0.0, 1.0);
	scale *= (value);
	if(clipping == 1){
		// c -= (max_scale - scale)  * 0.2 * plane;
		// c = vec3(inverse(modelMatrix) * vec4(c, 1.0));
		p = (p * scale) + center;
	}
	else
		p = (p * max_scale) + center;


	vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * mvPosition;
	pos = vec3(modelMatrix * vec4( p, 1.0));
	col = quality == 1 ? quality_color : mesh_color;
}
`;

let f_shader = `
precision highp float;

in vec3 pos;
in vec3 col;

out vec4 fragColor;

void main(){
	vec3 light_pos = vec3(10.0, 8.0, 15.0);

	float specular = 0.3;
	float shine = 0.1;
	
	vec3 N = normalize(cross(dFdx(pos),dFdy(pos)));
	 vec3 L = normalize(light_pos - pos);
	float lamb = clamp(dot(N, L), 0.2, 1.0);
	vec3 E = normalize(-pos);
	vec3 R = reflect(-L, N);
	float spec = pow(max(dot(R,E), 0.0), specular);
	vec3 specCol = mix(col, vec3(0.0), shine);
	fragColor = vec4(mix(col * lamb, specCol, spec), 1.0);
}
`;

export function loadVolumesView(format, fileStr, params = {}){
	const g = volumesGeometryFromStr(format, fileStr);
	const nb_hex = g.hex.length;

	const v_arrays = [
		new Float32Array(nb_hex * 3),
		new Float32Array(nb_hex * 3),
		new Float32Array(nb_hex * 3),
		new Float32Array(nb_hex * 3),
		new Float32Array(nb_hex * 3),
		new Float32Array(nb_hex * 3),
		new Float32Array(nb_hex * 3),
		new Float32Array(nb_hex * 3)
	];

	let n = 0;
	const centers = new Float32Array(nb_hex * 3);
	const P = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3,
		new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3
	];
	let center = new THREE.Vector3;


	const hex_qualities = [];
	let min_quality = Infinity;
	let max_quality = -Infinity;
	let avg_quality = 0;

	g.hex.forEach(hex => {
		center.set(0, 0, 0);
		for(let i = 0; i < 8; ++i){
			P[i].fromArray(g.v[hex[i]])
			if(params.axis)
				P[i].applyAxisAngle(params.axis, Math.PI/2);
			center.add(P[i]);
		}
		center.divideScalar(8);

		for(let i = 0; i < 8; ++i){
			v_arrays[i][n] = P[i].x - center.x;
			v_arrays[i][n + 1] = P[i].y - center.y;
			v_arrays[i][n + 2] = P[i].z - center.z;
		}
		centers[n++] = center.x;
		centers[n++] = center.y;
		centers[n++] = center.z;

		let qual = computeHexScaledJacobian(P);
		if(qual > max_quality) max_quality = qual;
		if(qual < min_quality) min_quality = qual;
		avg_quality += qual;
		hex_qualities.push(qual);
	});
	avg_quality /= nb_hex;
	max_quality = params.max || max_quality;
	min_quality = params.min || min_quality;
	const quality_diff = max_quality - min_quality;

	const green = new THREE.Color(0x2EEE71);
	const red = new THREE.Color(0xF74C3C);
	let color = new THREE.Color;
	const hex_colors = new Float32Array(nb_hex * 3);
	n = 0;
	hex_qualities.forEach(q => {
		color.copy(red).lerp(green, (q - min_quality)/ quality_diff);
		hex_colors[n++] = color.r;
		hex_colors[n++] = color.g;
		hex_colors[n++] = color.b;
	});

	const geometry = new THREE.BufferGeometry();
	const pos = [
		0.1, -0.1, -0.1,	-0.1, -0.1, -0.1,	-0.1, 0.1, -0.1,	0.1, 0.1, -0.1,
		0.1, -0.1, 0.1,		-0.1, -0.1, 0.1,	-0.1, 0.1, 0.1,		0.1, 0.1, 0.1
	]; // not actually used but here because firefox needs it

	const indices = [
		1, 0, 2,	2, 0, 3,	1, 5, 4,	1, 4, 0,
		0, 4, 3,	3, 4, 7,	3, 7, 6,	3, 6, 2, 
		1, 2, 5,	2, 6, 5,	5, 6, 4,	4, 6, 7	
	];

	geometry.setIndex(indices);
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( pos, 3 ) );
	geometry.setAttribute( 'quality_color', new THREE.InstancedBufferAttribute( hex_colors, 3 ) );
	geometry.setAttribute( 'center', new THREE.InstancedBufferAttribute( centers, 3 ) );
	geometry.setAttribute( 'v0', new THREE.InstancedBufferAttribute( v_arrays[0], 3 ) );
	geometry.setAttribute( 'v1', new THREE.InstancedBufferAttribute( v_arrays[1], 3 ) );
	geometry.setAttribute( 'v2', new THREE.InstancedBufferAttribute( v_arrays[2], 3 ) );
	geometry.setAttribute( 'v3', new THREE.InstancedBufferAttribute( v_arrays[3], 3 ) );
	geometry.setAttribute( 'v4', new THREE.InstancedBufferAttribute( v_arrays[4], 3 ) );
	geometry.setAttribute( 'v5', new THREE.InstancedBufferAttribute( v_arrays[5], 3 ) );
	geometry.setAttribute( 'v6', new THREE.InstancedBufferAttribute( v_arrays[6], 3 ) );
	geometry.setAttribute( 'v7', new THREE.InstancedBufferAttribute( v_arrays[7], 3 ) );

	let material = new THREE.RawShaderMaterial( {
		glslVersion: THREE.GLSL3,
		vertexShader: v_shader,
		fragmentShader: f_shader,
		depthTest: true,
		depthWrite: true,
		uniforms: {
			clipping: {value: 0},
			min_clipping: {value: -0.01},
			max_clipping: {value: 0},
			quality: {value: 0},
			max_scale: {value: 0.90},
			mesh_color: {value: meshColor}
		}
	} );

	let mesh = new THREE.InstancedMesh(geometry, material, nb_hex);

	return mesh;
}

export function loadSurfaceView(format, fileStr, params = {}){
	let g = surfaceGeometryFromStr(format, fileStr);

	const geometry = new THREE.Geometry();
	const position = [];
	const indices = [];

	g.v.forEach(v => {
		position.push(new THREE.Vector3(v[0], v[1], v[2]));
	});

	geometry.vertices = position;
	g.f.forEach(f => {
		for(let i = 2; i < f.length; i++){
			let face = new THREE.Face3(f[0],f[i-1],f[i]);
			geometry.faces.push(face);
		}
	});

	geometry.computeFaceNormals();

	let material = params.material || new THREE.MeshLambertMaterial({
		color: params.color || meshColor,
		side: params.side || THREE.FrontSide,
		transparent: params.transparent || false,
		opacity: params.opacity || 1
	});

	let mesh = new THREE.Mesh(geometry, material);

	return mesh;
}