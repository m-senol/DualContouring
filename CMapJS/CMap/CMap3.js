import CMap2 from './CMap2.js';

function CMap3(){
	CMap2.call(this);

	this.phi3 = this.addTopologyRelation("phi3");
	this.phis["3"] = this.phi3;
	
	this.vertex2 = this.vertex;
	this.face2 = this.face;
	this.edge2 = this.edge;
	this.vertex = this.addCelltype();
	this.edge = this.addCelltype();
	this.face = this.addCelltype();
	this.connex = this.addCelltype();

	const vertex2 = this.vertex2;
	const edge2 = this.edge2;
	const face2 = this.face2;
	const vertex = this.vertex;
	const edge = this.edge;
	const face = this.face;
	const volume = this.volume;
	const connex = this.connex;

	this.sewPhi3 = function(d0, d1){
		this.phi3[d0] = d1;
		this.phi3[d1] = d0;
	};

	this.unsewPhi3 = function(d){
		let d1 = this.phi3[d];
		this.phi3[d] = d;
		this.phi3[d1] = d1;
	};

	this.closeHole2 = this.closeHole;
	this.closeHole = function(d0, boundary = false, setEmbeddings = true) {
		// if(this.phi3[d0] != d0)
		// 	return;

		let visited = this.newMarker();
		let hole = this.newMarker();
		let faces = [d0];
		visited.markCell(face2, d0);

		do {
			let fd0 = faces.shift();

			// codegree of face... to be written 
			let codegree = 0;
			this.foreachDartOf(face2, fd0, d => {
				++codegree;
				visited.mark(d);
			});

			let fd_h = this.addFace(codegree, false);
			hole.markCell(face2, fd_h)

			let fd = fd0;
			do {
				let done = false;
				let d = this.phi3[this.phi2[fd]];
				do {
					if(this.phi3[d] == d){
						done = true;
						if(!visited.marked(d)){
							faces.push(d);
							visited.markCell(this.face2, d);
						}
					}
					else{
						if(hole.marked(d)){
							done = true;
							this.sewPhi2(d, fd_h);
						}
						else{
							d = this.phi3[this.phi2[d]];
						}
					}
				} while (!done);

				this.sewPhi3(fd_h, fd);
				fd_h = this.phi_1[fd_h];
				fd = this.phi1[fd];
			} while (fd != fd0);
		} while (faces.length);

		visited.remove();
		hole.remove();

		let wd = this.phi3[d0];

		if(boundary)
			this.markCellAsBoundary(volume, wd);

		if(setEmbeddings){
			let wid, ccid;
			if(this.isEmbedded(volume))
				wid = this.newCell(volume);
			if(this.isEmbedded(connex))
				ccid = this.cell(connex, d0);

			this.foreachDartOf(volume, wd, d00 => {
				if(this.isEmbedded(vertex2)){
					if(!Number.isInteger(this.cell(vertex2, d00))){
						let v2id = this.newCell(vertex2);
						this.foreachDartOf(vertex2, d00, d1 =>{ this.setEmbedding(vertex2, d1, v2id)});
					}
				}
				if(this.isEmbedded(edge2)){
					if(!Number.isInteger(this.cell(edge2, d00))){
						let e2id = this.newCell(edge2);
						this.foreachDartOf(edge2, d00, d1 =>{ this.setEmbedding(edge2, d1, e2id)});
					}
				}
				if(this.isEmbedded(face2)){
					if(!Number.isInteger(this.cell(face2, d00))){
						let f2id = this.newCell(face2);
						this.foreachDartOf(face2, d00, d1 =>{ this.setEmbedding(face2, d1, f2id)});
					}
				}
				if(wid != undefined){
					this.setEmbedding(volume, d00, wid);
				}
				if(this.isEmbedded(vertex)){
					if(!Number.isInteger(this.cell(vertex, d00))){
						let vid = this.cell(vertex, this.phi1[this.phi3[d00]]);
						this.foreachDartOf(vertex2, d00, d1 =>{ this.setEmbedding(vertex, d1, vid)});
					}
				}
				if(this.isEmbedded(edge)){
					if(!Number.isInteger(this.cell(edge, d00))){
						let eid = this.cell(edge, this.phi3[d00]);
						this.foreachDartOf(edge, d00, d1 =>{ this.setEmbedding(edge, d1, eid)});
					}
				}
				if(this.isEmbedded(face)){
					if(!Number.isInteger(this.cell(face, d00))){
						let eid = this.cell(face, this.phi3[d00]);
						this.foreachDartOf(face, d00, d1 =>{ this.setEmbedding(face, d1, eid)});
					}
				}
				if(ccid != undefined){
					this.setEmbedding(connex, d00, ccid);
				}
			});
		}

		return wd;
	};


	this.close2 = this.close;
	this.close = function(boundary = true, setEmbeddings = true){
		this.foreachDart(d0 => {
			if(this.phi3[d0] == d0)
				this.closeHole(d0, boundary, setEmbeddings);
		});
	};

	/// Traverses and applies func to all darts of face 3
	this.foreachDartPhi1Phi3 = function(d0, func){
		let stop;
		this.foreachDartPhi1(d0, d1 => {
			stop = func(d1);
			return stop;
		});
		if(!stop)
			this.foreachDartPhi1(this.phi3[d0], func);
	};

	/// Traverses and applies func to all darts of edge 3
	this.foreachDartPhi2Phi3 = function(d0, func){
		let d = d0;
		do {
			if(func(d)) break;
			d = this.phi2[d];

			if(func(d)) break;
			d = this.phi3[d];
		} while (d != d0);
	};

	/// Traverses and applies func to all darts of vertex 3
	this.foreachDartPhi21Phi31 = function(d0, func){
		let marker = this.newMarker();
		let volumes = [d0];
		marker.mark(d0);
		do {
			let d = volumes.shift();
			
			if(func(d))	
				break;
			let d_1 = this.phi_1[d];
			let d2 = this.phi2[d_1];
			if(!marker.marked(d2)){
				marker.mark(d2);
				volumes.push(d2)
			}
			d2 = this.phi3[d_1];
			if(!marker.marked(d2)){
				marker.mark(d2);
				volumes.push(d2)
			}

		}while(volumes.length);
		// marker.remove();
	};

	// Traverses and applies func to all darts of connex
	this.foreachDartPhi1Phi2Phi3 = function(d0, func){
		let marker = this.newMarker();
		let volumes = [d0];

		do {
			let wd = volumes.shift();
			if(!marker.marked(wd)){
				let d = wd;
				do {
					if(func(d))
						return;
					marker.mark(d);
					let adj2 = this.phi2[d];
					if(!marker.marked(adj2))
						volumes.push(adj2);
					d = this.phi1[d];
				} while (d != wd);
				let adj3 = this.phi3[d];
				if(!marker.marked(adj3))
					volumes.push(adj3);
			}
		} while(volumes.length);
	};

	this.funcsForeachDartOf[vertex] = this.foreachDartPhi21Phi31;

	this.funcsForeachDartOf[edge] = this.foreachDartPhi2Phi3;

	this.funcsForeachDartOf[face] = this.foreachDartPhi1Phi3;

	this.funcsForeachDartOf[connex] = this.foreachDartPhi1Phi2Phi3;


	this.degree = function(emb, cd) {
		let degree = 0;
		switch(emb) {
			case this.vertex: 
				this.foreachIncident(this.edge, this.vertex, cd, ed => {
					++degree;
				});
				break;
			case this.edge:
				this.foreachIncident(this.face, this.edge, cd, fd => {
					++degree;
				});
				break;
			case this.face:
				if(this.isBoundary(cd) || this.isBoundary(this.phi3[cd]))
					degree = 1;
				else 
					degree = 2;
				break;
			default:
		}
		return degree;
	}

	this.codegree = function(emb, cd) {
		let codegree = 0;
		switch(emb) {
			case this.edge: 
				this.foreachIncident(this.vertex, this.edge, cd, vd => {
					++codegree;
				});
				break;
			case this.face: 
				this.foreachIncident(this.edge, this.face, cd, ed => {
					++codegree;
				});
				break;
			case this.volume:
				this.foreachIncident(this.face, this.volume, cd, fd => {
					++codegree;
				});
				break;
			default:
		}
		return codegree;
	}


	/// OPERATIONS
	this.cutEdge2 = this.cutEdge;
	this.cutEdge = function(ed, setEmbeddings = true){
		let d0 = ed;
		let d23 = this.phi3[this.phi2[d0]];
		let vd = this.cutEdge2(d0, false);

		let d3;
		while(d23 != ed){
			d0 = d23;
			d23 = this.phi3[this.phi2[d0]];
			this.cutEdge2(d0, false);
			d3 = this.phi3[d0];
			this.unsewPhi3(d0);
			this.sewPhi3(d0, this.phi1[d3]);
			this.sewPhi3(d3, this.phi1[d0]);
		}
		d3 = this.phi3[ed];
		this.unsewPhi3(ed);
		this.sewPhi3(ed, this.phi1[d3]);
		this.sewPhi3(d3, this.phi1[ed]);

		if(setEmbeddings){
			if(this.isEmbedded(vertex2)){
				let d = vd;
				do{
					let v2id = this.newCell(vertex2);
					this.setEmbedding(vertex2, d, v2id);
					this.setEmbedding(vertex2, this.phi1[this.phi2[d]], v2id);
					d = this.phi3[this.phi2[d]];
				} while(d != vd);
			}
			if(this.isEmbedded(edge2)){
				let d = vd;
				do{
					let e2id = this.newCell(edge2);
					this.setEmbedding(edge2, d, e2id);
					this.setEmbedding(edge2, this.phi2[d], e2id);
					d = this.phi3[this.phi2[d]];
				}while(d != vd);
			}
			if(this.isEmbedded(face2)){

			}
			if(this.isEmbedded(volume)){

			}
			if(this.isEmbedded(vertex)){
				let vid = this.newCell(vertex);
				this.foreachDartOf(vertex, vd, d => {this.setEmbedding(vertex, d, vid)});
			}
			if(this.isEmbedded(edge)){

			}
			if(this.isEmbedded(face)){

			}
			if(this.isEmbedded(connex)){
			}
		}
		return vd;
	};

	this.cutFace2 = this.cutFace;
	this.cutFace = function(fd0, fd1, setEmbeddings = true){
		let d0 = this.phi1[this.phi3[fd0]];
		let d1 = this.phi1[this.phi3[fd1]];

		this.cutFace2(fd0, fd1, false);
		this.cutFace2(d0, d1, false);

		this.sewPhi3(this.phi_1[fd0], this.phi_1[d1])
		this.sewPhi3(this.phi_1[fd1], this.phi_1[d0])

		let ed = this.phi_1[d0];

		if(setEmbeddings){
			if(this.isEmbedded(vertex2)){

			}
			if(this.isEmbedded(edge2)){

			}
			if(this.isEmbedded(face2)){

			}
			if(this.isEmbedded(volume)){

			}
			if(this.isEmbedded(vertex)){
				this.setEmbedding(vertex, this.phi_1[d1], this.cell(vertex, fd0))
				this.setEmbedding(vertex, this.phi_1[fd1], this.cell(vertex, fd0))
				this.setEmbedding(vertex, this.phi_1[d0], this.cell(vertex, fd1))
				this.setEmbedding(vertex, this.phi_1[fd0], this.cell(vertex, fd1))
			}
			if(this.isEmbedded(edge)){

			}
			if(this.isEmbedded(face)){

			}
			if(this.isEmbedded(connex)){
			}
		}
		return ed;
	};

	this.cutVolume = function(path, setEmbeddings = true){
		let fd0 = this.addFace(path.length, false);
		let fd1 = this.addFace(path.length, false);

		let d0, d1;
		for(let i = 0; i < path.length; ++i){
			d0 = path[i];
			d1 = this.phi2[d0];
			this.unsewPhi2(d0);

			this.sewPhi2(d0, fd0);
			this.sewPhi2(d1, fd1);
			this.sewPhi3(fd0, fd1);

			fd0 = this.phi_1[fd0];
			fd1 = this.phi1[fd1];
		}
		fd0 = this.phi_1[fd0];

		if(setEmbeddings){
			if(this.isEmbedded(vertex2)){

			}
			if(this.isEmbedded(edge2)){

			}
			if(this.isEmbedded(face2)){

			}
			if(this.isEmbedded(volume)){

			}
			if(this.isEmbedded(vertex)){
				this.foreachDartOf(face, fd0, d => {
					this.setEmbedding(vertex, d, this.cell(vertex, this.phi1[this.phi2[d]]));
				});
			}
			if(this.isEmbedded(edge)){

			}
			if(this.isEmbedded(face)){

			}
			if(this.isEmbedded(connex)){
			}
		}
	};

	this.collapseEdge;
	this.mergeFaces;
	this.mergeVolumes;

}

export default CMap3;
