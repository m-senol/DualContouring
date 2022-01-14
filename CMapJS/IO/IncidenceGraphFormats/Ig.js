export function importIG(off_str) {
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
	let VEF = line.split(" ");

	// get vertices positions
	let vertices = [];
	for(let i = 0; i < VEF[0]; i++)
	{
		line = lines[j++];
		vertices.push(line.split(" "));
	}
	
	// get edges connectivities
	let edges = [];
	for(let i = 0; i < VEF[1]; i++)
	{
		line = lines[j++];
		edges.push(line.split(" "));
	}

	// get faces id
	let faces = [];
	for(let i = 0; i <VEF[2]; i++)
	{
		line = lines[j++];
		let face = line.split(" ");
		face.shift();
		faces.push(face);
	}
	vertices = vertices.map(x => x.map(y => parseFloat(y)));
	edges = edges.map(x => x.map(y => parseInt(y)));
	faces = faces.map(x => x.map(y => parseInt(y)));
	
	return {v: vertices, e:edges, f:faces};
}

export function exportIG(geometry){
	let str = "IG\n";
	str += geometry.v.length + " " + geometry.e.length + " " + geometry.f.length + "\n";

	geometry.v.forEach( v => {
		str += v[0] + " " + v[1] + " " + v[2] + "\n";
	});

	geometry.e.forEach( e => {
		str += e[0] + " " + e[1] + "\n";
	});

	geometry.f.forEach( face => {
		str += face.length + " ";
		face.forEach(e => {str += e + " "}); 
		str += "\n";
	});
	return str;
}