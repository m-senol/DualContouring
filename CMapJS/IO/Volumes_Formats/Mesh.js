export function loadMesh(mesh_str) {
	let lines = mesh_str.split("\n");
	for(let i = 0; i < lines.length; i++)
	{
		lines[i] = lines[i].replace(/\s\s+/g, ' ').trim();
	}
	let line;
	// skip header
	// MeshVersionFormatted 1
	let j = 0;
	line = lines[j++];
	line.match(/MeshVersionFormatted 1/);
	// Dimension
	line = lines[j++];
	line.match(/Dimension/);
	// 3
	line = lines[j++];
	parseInt(line) == 3;

	/// vertex handling
	
	line = lines[j++];
	line.match(/Vertices/);

	line = lines[j++];
	let nb_vertices = parseInt(line);
	// get vertices positions
	let vertices = [];
	for(let i = 0; i < nb_vertices; ++i)
	{
		line = lines[j++];
		line = line.split(" ");
		line.length = 3;
		vertices.push(line);
	}        
	// get quads (useless)
	line = lines[j++];
	line.match(/Quads/);
	line = lines[j++];
	let nb_quads = parseInt(line);
	let quads = [];
	for(let i = 0; i < nb_quads; ++i)
	{
	line = lines[j++];
		// line = line.split(" ");
		// line.length = 4;
		// quads.push(line);
	}   

	// get hex id
	line = lines[j++];
	line.match(/Hexahedra/);
	line = lines[j++];
	let nb_hexs = parseInt(line);
	let hexes = [];
	for(let i = 0; i < nb_hexs; ++i)
	{
		line = lines[j++];
		line = line.split(" ");
		line.length = 8;
		hexes.push(line);
	}

	hexes = hexes.map(x => x.map(y => parseInt(y) - 1));
	// quads = quads.map(x => x.map(y => parseInt(y) - 1));
	vertices = vertices.map(x => x.map(y => parseFloat(y)));
	// console.log("file loaded: " + vertices.length + " vertices, " + hexes.length + " faces");
	return {v: vertices, quad: quads, hex:hexes};
}


export function exportMesh(geometry){
	
}