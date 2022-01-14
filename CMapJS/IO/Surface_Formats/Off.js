export function loadOff(off_str) {
	let lines = off_str.split("\n");
	for(let i = 0; i < lines.length; i++)
	{
		lines[i] = lines[i].replace(/\s\s+/g, ' ').trim();
	}
	let line;
	let j = 0;

	// skip header
	while(!parseInt(line = lines[j++]) && lines.length)
	{}
	// get nb_vert nbFace nbEdge(=0)
	let v_f_e = line.split(" ");
	// get vertices positions
	let vertices = [];
	for(let i = 0; i < v_f_e[0]; i++)
	{
		line = lines[j++];
		vertices.push(line.split(" "));
	}        
	// get faces id
	let faces = [];
	for(let i = 0; i < v_f_e[1]; i++)
	{
		line = lines[j++];
		let face0 = line.split(" ");
		let v_nb = face0.shift();
		faces.push(face0);
	}
	vertices = vertices.map(x => x.map(y => parseFloat(y)));
	faces = faces.map(x => x.map(y => parseInt(y)));
	
	return {v: vertices, f:faces};
}

export function exportOff(geometry){
	let str = "OFF\n";
	str += geometry.v.length + " " + geometry.f.length + " 0\n";

	geometry.v.forEach(
		vert => {
			str += vert[0] + " " + vert[1] + " " + vert[2] + "\n";
	});
	geometry.f.forEach(
		face => {
			str += face.length + " ";
			face.forEach(vert => {str += vert + " "}); 
			str += "\n";
		});
	return str;
}