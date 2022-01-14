import AttributesContainer from './AttributeContainer.js';

/// Base Structure for CMaps, further extended and specialized later
function IncidenceGraph(){
	/// Attribute containers for all cell types
	const attributeContainers = [];
	// /// Dart topological relations
	// const topology = {};
	/// Cell embeddings
	const embeddings = [];
	/// stored markers
	this.storedMarkers = [];
	// /// Cells
	// const cells = [];

	/// All cell types dart traversor functions
	this.funcsForeach = [];
	/// All cell types incident traversors functions
	this.funcsForeachIncident = [];

	/// Creates a new cell type by adding an attribute container to the map
	this.addCelltype = function(){
		const emb = attributeContainers.length;
		attributeContainers[emb] = new AttributesContainer();
		this.funcsForeachIncident[emb] = [];
		this.storedMarkers[emb] = [];		
		return emb;
	};

	/// Adds an attribute to given embedding
	this.addAttribute = function(emb, name){
		return attributeContainers[emb].createAttribute(name)	
	};

	/// Gets attribute of given embedding and name if it exists
	this.getAttribute = function(emb, name){	
		return attributeContainers[emb].getAttribute(name)	
	};

	/// Deletes given attribute 
	this.removeAttribute = function(emb, attrib){	
		attributeContainers[emb].removeAttribute(attrib.name)	
	};

	/// Creates a new cell of given embedding
	this.newCell = function(emb){	
		let c = attributeContainers[emb].newElement();
		embeddings[emb][c] = c;
		return c;
	};

	/// Counts cells of given type
	this.nbCells = function(emb){
		let i = 0;
		this.foreach(emb, c => {++i}, {useEmb: this.isEmbedded(emb)});
		return i;
	};

	/// Deletes given cell
	this.deleteCell = function(emb, e){	
		attributeContainers[emb].deleteElement(e);
		embeddings[emb][e] = -1;
	};

	/// Adds new embedding for cell
	this.createEmbedding = function(emb){	
		if(!embeddings[emb])	
			embeddings[emb] = this.addAttribute(emb, "<emb_" + emb + ">")	
	};

	/// Verifies cell type embedding
	this.isEmbedded = function(emb){	
		return (embeddings[emb]? true : false);
	};

	/// Gets cell embedding of the cell type - for renderer compatibility
	this.cell = function(emb, c){
		return embeddings[emb][c];
	};

	/// Traverses and applies func to all cells (of map or cache) of given celltype
	this.foreach = function(emb, func, {cache, useEmb} =  {cache: undefined, useEmb: undefined}){
		if(cache){
			cache.forEach(c => func(c));
			return;
		}

		embeddings[emb].some(c => (c != -1) ? func(c) : undefined);
	};

	// /// Traverses incident cells of  given type
	// /// incEmb : incident cell type
	// /// cellEmb : targete cell type
	// /// c : target cell
	this.foreachIncident = function (incEmb, cellEmb, c, func){
		this.funcsForeachIncident[cellEmb][incEmb](c, func);
	};

	// /// Returns array|cache of incident cells of given type
	this.incident = function (incEmb, cellEmb, c) {
		const incidentCells = [];
		this.foreachIncident(incEmb, cellEmb, c, ic => {
			incidentCells.push(ic);
		});
		return incidentCells;
	}

	/// Stores all cells of given type in an array
	this.cache = function (emb, cond){
		let cache = [];

		if(!cond)
			this.foreach(emb, c => { cache.push(c) });
		else
			this.foreach(emb, c => { if(cond(c)) cache.push(c) });
			
		return cache;
	};

	/// Clears all data
	this.deleteMap = function(){
		attributeContainers.forEach(ac => ac.delete());
		Object.keys(this).forEach(key => delete this[key]);
	};


	/// Returns a dart marker or a cell marker of given embedding 
	this.newMarker = function(usedEmb){
		if(this.storedMarkers[usedEmb].length)
			return this.storedMarkers[usedEmb].pop();

		return new Marker(this, usedEmb);
	};




	this.vertex = this.addCelltype();
	this.createEmbedding(this.vertex);
	const incidentEdgesToVertex = this.addAttribute(this.vertex, "incidentEdges"); 
	
	this.edge = this.addCelltype();
	this.createEmbedding(this.edge);
	const incidentVerticesToEdge = this.addAttribute(this.edge, "incidentVertices"); 
	const incidentFacesToEdge = this.addAttribute(this.edge, "incidentFaces"); 
	
	this.face = this.addCelltype();
	this.createEmbedding(this.face);
	const incidentEdgesToFace = this.addAttribute(this.face, "incidentEdges");
	const incidentEdgesToFaceDir = this.addAttribute(this.face, "incidentEdgesDir");

	this.debug = function(){
		console.log(attributeContainers, embeddings);
		console.log(incidentVerticesToEdge, incidentFacesToEdge,
			incidentEdgesToFace, incidentEdgesToVertex);
	};

	this.funcsForeachIncident[this.vertex][this.edge] = function (v, func) {
		incidentEdgesToVertex[v].forEach(e => {
			func(e);
		});
	};

	this.funcsForeachIncident[this.vertex][this.face] = function (v, func) {
		let marker = new Set;
		incidentEdgesToVertex[v].forEach(e => {
			incidentFacesToEdge[e].forEach(f => {
				if(!marker.has(f)) {
					marker.add(f);
					func(f);
				}
			});
		});
	};

	this.funcsForeachIncident[this.edge][this.vertex] = function (e, func) {
		func(incidentVerticesToEdge[e].v0);			
		func(incidentVerticesToEdge[e].v1);			
	};

	this.funcsForeachIncident[this.edge][this.face] = function (e, func) {
		incidentFacesToEdge[e].forEach(f => {
			func(f);
		});
	};

	this.funcsForeachIncident[this.face][this.vertex] = function (f, func) {
		let marker = new Set;
		incidentEdgesToFace[f].forEach(e => {	
			if(!marker.has(incidentVerticesToEdge[e].v0)) {
				marker.add(incidentVerticesToEdge[e].v0);
				func(incidentVerticesToEdge[e].v0);
			}
			if(!marker.has(incidentVerticesToEdge[e].v1)) {
				marker.add(incidentVerticesToEdge[e].v1);
				func(incidentVerticesToEdge[e].v1);
			}
		});
	};

	this.funcsForeachIncident[this.face][this.edge] = function (f, func) {
		incidentEdgesToFace[f].forEach(e => {func(e)});
	};

	/// Foreach each adjacent currEmb through thruEmb of c
	this.foreachAdjacent = function (thruEmb, currEmb, c, func) {
		const marker = this.newMarker(currEmb);
		marker.mark(c);

		this.foreachIncident(thruEmb, currEmb, c, thruc => {
			this.foreachIncident(currEmb, thruEmb, thruc, adjc => {
				if(!marker.marked(adjc)) {
					func(adjc);
					marker.mark(adjc);
				}
			});
		});
	}

	this.addVertex = function () {
		let v = this.newCell(this.vertex);
		incidentEdgesToVertex[v] = new Set;
		return v;
	};

	this.deleteVertex = function (v) {
		this.foreachIncident(this.edge, this.vertex, v, e => {this.deleteEdge(e)});
		this.deleteCell(this.vertex, v);
	};

	this.addEdge = function(v0, v1) {
		let e = this.newCell(this.edge);
		incidentVerticesToEdge[e] = {v0, v1};
		incidentEdgesToVertex[v0].add(e);
		incidentEdgesToVertex[v1].add(e);
		incidentFacesToEdge[e] = new Set;
		return e;
	};
	
	this.deleteEdge = function(e) {
		this.foreachIncident(this.face, this.edge, e, f => {
			this.deleteFace(f);
		});
		this.foreachIncident(this.vertex, this.edge, e, v => {
			incidentEdgesToVertex[v].delete(e);
		});
		this.deleteCell(this.edge, e);
	};

	function sortEdges(sorted, unsorted) {
		sorted.push(unsorted.pop());
		const v0 = incidentVerticesToEdge[sorted[0]].v0;
		let v = incidentVerticesToEdge[sorted[0]].v1;
		let broken = false;
		while(unsorted.length) {
			let i, end;
			for(i = 0, end = unsorted.length; i < unsorted.length; ++i) {
				const e = unsorted[i];
				const evs = incidentVerticesToEdge[e];
				const ev = ( evs.v0 == v ? 
					evs.v1 : ( evs.v1 == v ?
						 evs.v0 : undefined )
				);
				if( ev != undefined ) {
					v = ev;
					sorted.push(unsorted[i]);
					unsorted.splice(i, 1);
					break;
				}
			}
			broken = v == v0 || i == end;
			if (broken)
				break;
		}

		return (broken && unsorted.length == 0);
	}

	this.addFace = function(...edges) {
		let sorted = []
		if(edges.length > 2 && sortEdges(sorted, edges)) {
			let f = this.newCell(this.face);
			incidentEdgesToFace[f] = sorted;
			incidentEdgesToFaceDir[f] = new Array(sorted.length);
			sorted.forEach(e => {incidentFacesToEdge[e].add(f);});
			for(let i = 0; i < sorted.length; ++i) {
				const v0 = incidentVerticesToEdge[sorted[i]].v0;
				const vs = incidentVerticesToEdge[sorted[(i + 1) % sorted.length]];
				if(v0 == vs.v0 || v0 == vs.v1)
					incidentEdgesToFaceDir[f][i] = 1;
				else
					incidentEdgesToFaceDir[f][i] = 0;
			}

			return f;
		}
	};

	this.deleteFace = function(f) {
		this.foreachIncident(this.edge, this.face, f, e => {
			incidentFacesToEdge[e].delete(f);
		});
		this.deleteCell(this.face, f);
	};

	function findCommonVertex(e0 , e1) {
		if((incidentVerticesToEdge[e0].v0 == incidentVerticesToEdge[e1].v0) ||  
			(incidentVerticesToEdge[e0].v0 == incidentVerticesToEdge[e1].v1))
			return incidentVerticesToEdge[e0].v0;
		if((incidentVerticesToEdge[e0].v1 == incidentVerticesToEdge[e1].v0) ||  
			(incidentVerticesToEdge[e0].v1 == incidentVerticesToEdge[e1].v1))
			return incidentVerticesToEdge[e0].v1;
		return -1;
	}

	// sorts a loop of edges
	this.sortedFaceVertices = function (edges) {
		const sortedVertices = [];
		for(let i = 0; i < edges.length; ++i) {
			sortedVertices.push(findCommonVertex(edges[i], edges[(i + 1) % edges.length]));
		}
		sortedVertices.unshift(sortedVertices.pop());
		return sortedVertices;
	}

	this.cutEdge = function(e0) {
		const v1 = this.addVertex();
		const e0vs = incidentVerticesToEdge[e0];
		incidentEdgesToVertex[e0vs.v1].delete(e0);
		const e1 = this.addEdge(v1, e0vs.v1);
		e0vs.v1 = v1;
		incidentEdgesToVertex[v1].add(e0);
		this.foreachIncident(this.face, this.edge, e0, f => {
			incidentFacesToEdge[e1].add(f);
			incidentEdgesToFace[f].push(e1);
			let sorted = [];
			sortEdges(sorted, incidentEdgesToFace[f]);
			incidentEdgesToFace[f] = sorted;
		});
		return v1;
	};

	this.cutFace = function(f, v0, v1) {
		const unsortedEdges = [];
		this.foreachIncident(this.edge, this.face, f, e => {unsortedEdges.push(e)});
		const sortedEdges = [];
		sortEdges(sortedEdges, unsortedEdges);
		const sortedVertices = this.sortedFaceVertices(sortedEdges);
		const first = [];
		const second = [];
		let inside = false;
		for(let i = 0; i < sortedEdges.length; ++i) {
			if(sortedVertices[i] == v0 || sortedVertices[i] == v1) {
				inside = !inside;
				console.log(inside)
			}
			inside ? second.push(sortedEdges[i]) : first.push(sortedEdges[i]);
		}
		let e = this.addEdge(v0, v1);
		first.push(e);
		second.push(e);

		console.log(first, second);

		let str1 = "";
		this.foreach(this.edge, e => {
			str1 +=  "( " + e + ": " + incidentVerticesToEdge[e].v0 + " - " + incidentVerticesToEdge[e].v1 +" )";
		}, {cache: first});

		let str2 = "\n";
		this.foreach(this.edge, e => {
			str2 += "( "  + e + ": "+ incidentVerticesToEdge[e].v0 + " - " + incidentVerticesToEdge[e].v1 +" )";
		}, {cache: second});

		this.deleteFace(f);
		let f0 = this.addFace(...first);
		let f1 = this.addFace(...second);
	};


	let CellMarkerProto = {
		ig: undefined, 
		emb: undefined,
	
		mark: function(c) {this[this.ig.cell(this.emb, c)] = true},
		unmark: function(c) {this[this.ig.cell(this.emb, c)] = false},
		marked: function(c) {return this[this.ig.cell(this.emb, c)]},
	};
	
	let MarkerRemover = {
		remove: function(){
			this.fill(null);
			this.ig.storedMarkers[this.emb].push(this);
		}
	};
	
	function Marker(ig, usedEmb){
		let marker;
		marker = Object.assign([], CellMarkerProto);
		marker.emb = usedEmb;
		marker.ig = ig;
		Object.assign(marker, MarkerRemover);
		return marker;
	}
	
	this.degree = function(emb, c) {
		let degree = 0;
		switch(emb) {
			case this.vertex: 
				this.foreachIncident(this.edge, this.vertex, c, e => {
					++degree;
				});
				break;
			case this.edge:
				this.foreachIncident(this.face, this.edge, c, f => {
					++degree;
				});
				break;
			case this.face:
				degree = 1; 
				break;
			default:
		}
		return degree;
	}

	this.codegree = function(emb, c) {
		let codegree = 0;
		switch(emb) {
			case this.edge: 
				this.foreachIncident(this.vertex, this.edge, c, v => {
					++codegree;
				});
				break;
			case this.face: 
				this.foreachIncident(this.edge, this.face, c, e => {
					++codegree;
				});
				break;
			default:
		}
		return codegree;
	}
}



export default IncidenceGraph;


/// TODO:
/// - FIX FOREACH INTERRUPTION
/// - MODIFY MARKERS TO SET IN INCIDENCE GRAPHE AND CMAPBASE

