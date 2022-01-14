import AttributesContainer from './AttributeContainer.js';

/// Base Structure for CMaps, further extended and specialized later
function CMapBase(){

	/// Attribute containers for all cell types
	const attributeContainers = [];
	/// Dart topological relations
	const topology = {};
	/// Dart cell embeddings
	const embeddings = [];
	/// stored markers
	this.storedMarkers = [];
	this.storedMarkers = [];

	/// All cell types dart traversor functions
	this.funcsForeachDartOf = [];
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
	
	/// Adds a topological relation to darts
	this.addTopologyRelation = function(name){
		topology[name] = this.addAttribute(this.dart, "<topo_" + name + ">");
		return topology[name];
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
		return attributeContainers[emb].newElement();	
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
		if(embeddings[emb])
			embeddings[emb][e] = null;	
	};

	/// Adds new embedding for darts
	this.createEmbedding = function(emb){	
		if(!embeddings[emb])	
			embeddings[emb] = this.addAttribute(this.dart, "<emb_" + emb + ">")	
	};

	/// Verifies cell type invading
	this.isEmbedded = function(emb){	
		return (embeddings[emb]? true : false);
	};

	/// Gets dart embedding of the cell type
	this.cell = function(emb, d){
		return embeddings[emb][d];
	};

	/// Sets given embedding to given dart
	this.setEmbedding = function(emb, d, i){
		attributeContainers[emb].ref(i);
		attributeContainers[emb].unref(embeddings[emb][d]);	
		return embeddings[emb][d] = i;
	};

	/// Sets all dart embeddings for a given cell type
	this.setEmbeddings = function(emb){
		if(!this.isEmbedded(emb))
			this.createEmbedding(emb);

		this.foreach(emb, cd => {
			let cid = this.newCell(emb);
			this.foreachDartOf(emb, cd, d => {this.setEmbedding(emb, d, cid)});
		});
	};

	/// Creates a new dart in the map
	this.newDart = function(){
		let newId = this.newCell(this.dart);
		attributeContainers[this.dart].ref(newId);
		Object.values(topology).forEach(relation => relation[newId] = newId);
		return newId;
	};

	/// Deletes given dart
	this.deleteDart = function(d){
		for(let emb = 0; emb < attributeContainers.length; ++emb)
			if(this.isEmbedded(emb)){
				attributeContainers[emb].unref(embeddings[emb][d]);
				embeddings[emb][d] = null;
			}
		topology.d[d] = -1;
		attributeContainers[this.dart].deleteElement(d);
	};

	/// Traverses all darts in the map
	/// interupts if func returns true
	this.foreachDart = function(func){
		topology.d.some( d => (d != -1) ? func(d) : undefined );
	};

	/// Counts darts in the map
	this.nbDarts = function(){
		return attributeContainers[this.dart].nbElements();
	};
	
	/// Traverses and applies func to all cells (of map or cache) of given celltype
	this.foreach = function(emb, func, {cache, useEmb} =  {cache: undefined, useEmb: undefined}){
		if(cache){
			cache.forEach(cd => func(cd));
			return;
		}

		let marker = this.newMarker(useEmb? emb : undefined);
		if(useEmb)
			this.foreachDart(d => {
				if(marker.marked(d))
					return;

				marker.mark(d);
				return func(d);
			});
		else
			this.foreachDart(d => {
				if(marker.marked(d))
					return;

				marker.markCell(emb, d);
				return func(d);
			});	
	};

	/// Traverses and applies func to all darts of a cell 
	this.foreachDartOf = function(emb, cd, func){
		this.funcsForeachDartOf[emb].call(this, cd, func);
	};

	/// Counts number of dart of given cell
	this.nbDartsOfOrbit = function(emb, cd) {
		let count = 0;
		this.foreachDartOf(emb, cd, d => {
			++count;
		});
		return count;
	}

	/// Traverses incident cells of  given type
	/// incEmb : incident cell type
	/// cellEmb : targete cell type
	/// cd : target cell
	/// useEmbedding switches to cell marker instead of darts
	this.foreachIncident = function(incEmb, cellEmb, cd, func, useEmbeddings = false){
		let marker = this.newMarker(useEmbeddings ? incEmb : undefined);
		if(useEmbeddings)
			this.foreachDartOf(cellEmb, cd, d0 => {
				if(!marker.marked(d0)){
					marker.mark(d0);
					return func(d0);
				}
			});
		else
			this.foreachDartOf(cellEmb, cd, d0 => {
				if(!marker.marked(d0)){
					marker.markCell(incEmb, d0);
					return func(d0);
				}
			});
	};

	/// Stores all cells of given type in an array
	/// cond : condition for adding to the cache
	this.cache = function(emb, cond){
		let cache = [];

		if(!cond)
			this.foreach(emb, cd => { cache.push(cd) },  {useEmb: this.isEmbedded(emb)});
		else
			this.foreach(emb, cd => { if(cond(cd)) cache.push(cd) },  {useEmb: this.isEmbedded(emb)});
			
		return cache;
	};

	/// Clears all data
	this.deleteMap = function(){
		attributeContainers.forEach(ac => ac.delete());
		Object.keys(this).forEach(key => delete this[key]);
	};

	/// Closes topology into manifold
	this.close = function() {}

	this.dart = this.addCelltype();

	this.funcsForeachDartOf[this.dart] = function(d, func) {func(d);};

	this.d = this.addTopologyRelation("d");

	/// Returns a dart marker or a cell marker of given embedding 
	this.newMarker = function(usedEmb) {
		if(this.storedMarkers[usedEmb? usedEmb : this.dart].length)
			return this.storedMarkers[usedEmb? usedEmb : this.dart].pop();

		return new Marker(this, usedEmb);
	};

	this.newMarker = function(usedEmb) {
		return new Marker(this, usedEmb);
	};

	let boundaryMarker = this.newMarker();
	this.markAsBoundary = function(d) {
		boundaryMarker.mark(d);
	};

	this.unmarkAsBoundary = function(d) {
		boundaryMarker.unmark(d);
	};

	this.markCellAsBoundary = function(emb, cd) {
		boundaryMarker.markCell(emb, cd)
	};

	this.unmarkCellAsBoundary = function(emb, cd) {
		boundaryMarker.unmarkCell(emb, cd);
	};

	this.isBoundary = function(d) {
		return boundaryMarker.marked(d);
	};

	this.isBoundaryCell = function(emb, cd) {
		return boundaryMarker.markedCell(emb, cd);
	};

	// // Garbage to fix
	// this.degree = function(emb, cd) {
	// 	let deg = 0;
	// 	this.foreachDartOf(emb, cd, d => {
	// 		++deg;
	// 	});
	// 	return deg;
	// };

	this.debug = function(){
		console.log(attributeContainers, topology, embeddings);
	}
}

let DartMarkerProto = {
	cmap: undefined,

	mark: function(d) {	this[d] = true;	},
	unmark: function(d) { this[d] = true; },
	marked: function(d) { return this[d]},
	markCell: function(emb, cd) {this.cmap.foreachDartOf(emb, cd, d => this.mark(d))},
	unmarkCell: function(emb, cd) {this.cmap.foreachDartOf(emb, cd, d => this.unmark(d))},
	markedCell: function(emb, cd) {
		let marked = true;
		this.cmap.foreachDartOf(emb, cd, d => { 
			marked &= this.marked(d);
		});
		return marked;
	},
};

let CellMarkerProto = {
	cmap: undefined, 
	emb: undefined,

	mark: function(d) {this[this.cmap.cell(this.emb, d)] = true},
	unmark: function(d) {this[this.cmap.cell(this.emb, d)] = false},
	marked: function(d) {return this[this.cmap.cell(this.emb, d)]},
};
/// Change for set -> mark == add, unmark == delete, marked == has

let MarkerRemover = {
	remove: function(){
		this.fill(null);
		this.cmap.storedMarkers[this.emb || this.cmap.dart].push(this);
	}
};

function Marker(cmap, usedEmb) {
	let marker;
	if(usedEmb){
		marker = Object.assign([], CellMarkerProto);
		marker.emb = usedEmb;
	}
	else
		marker = Object.assign([], DartMarkerProto);
	marker.cmap = cmap;
	Object.assign(marker, MarkerRemover);
	return marker;
}


export default CMapBase;