import { Vector3 } from '../Libs/three.module.js';

export function BoundingBox(position){
	let min = position[0].clone();
	let max = position[0].clone();

	position.forEach(v => {
		if(v.x < min.x)
			min.x = v.x;
		else if(v.x > max.x)
			max.x = v.x;

		if(v.y < min.y)
			min.y = v.y;
		else if(v.y > max.y)
			max.y = v.y;

		if(v.z < min.z)
			min.z = v.z;
		else if(v.z > max.z)
			max.z = v.z;
	});

	let mid = new Vector3;
	mid.addVectors(min, max).multiplyScalar(0.5);
	return {min, max, mid};
}