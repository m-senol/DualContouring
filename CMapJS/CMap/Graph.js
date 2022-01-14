import CMapBase from './CMapBase.js'

function Graph()
{
	CMapBase.call(this);

	this.alpha0 = this.addTopologyRelation("alpha0");
	this.alpha1 = this.addTopologyRelation("alpha1");
	this.alpha_1 = this.addTopologyRelation("alpha_1");

	this.sewAlpha0 = function(d0, d1){
		this.alpha0[d0] = d1;
		this.alpha0[d1] = d0;
	};

	this.unsewAlpha0 = function(d0){
		const d1 = this.alpha0[d0];
		this.alpha0[d0] = d0;
		this.alpha0[d1] = d1;
	};

	this.sewAlpha1 = function(d0, e0){
		const d1 = this.alpha1[d0];
		const e1 = this.alpha1[e0];
		this.alpha1[d0] = e1;
		this.alpha1[e0] = d1;
		this.alpha_1[d1] = e0;
		this.alpha_1[e1] = d0;
	};

	this.unsewAlpha1 = function(d0){
		const d1 = this.alpha1[d0];
		const d_1 = this.alpha_1[d0];

		this.alpha1[d0] = d0;
		this.alpha_1[d0] = d0;
		this.alpha1[d_1] = d1;
		this.alpha_1[d1] = d_1;
	};

	this.foreachDartAlpha0 = function(d0, func){
		if(!func(d0))
			func(this.alpha0[d0]);
	};

	this.foreachDartAlpha1 = function(d0, func){
		let d = d0;
		do{
			if(func(d)) break;
			d = this.alpha1[d];
		} while(d != d0)
	};

	this.vertex = this.addCelltype();

	this.funcsForeachDartOf[this.vertex] = this.foreachDartAlpha1;

	this.edge = this.addCelltype();

	this.funcsForeachDartOf[this.edge] = this.foreachDartAlpha0;

	this.addVertex = function(setEmbeddings = true){
		let d = this.newDart();
		if(setEmbeddings){
			if(this.isEmbedded(this.vertex))
				this.setEmbedding(this.vertex, d, this.newCell(this.vertex));
		}
		return d;
	};

	this.deleteVertex = function(vd0, setEmbeddings = true){
		let vd1 = this.alpha1[vd0];
		while(vd1 != vd0){
			let vd_1 = vd1;
			vd1 = this.alpha1[vd1];
			this.disconnectVertices(this.alpha0[vd_1], vd_1, setEmbeddings);
		}
		this.disconnectVertices(this.alpha0[vd0], vd0, setEmbeddings);
		this.deleteDart(vd0);
	};

	this.connectVertices = function(d0, e0, setEmbeddings = true){
		let d = (this.alpha0[d0] == d0)? d0 : this.newDart(); 
		let e = (this.alpha0[e0] == e0)? e0 : this.newDart();
		if(d != d0) this.sewAlpha1(d0, d);
		if(e != e0) this.sewAlpha1(e0, e);

		this.sewAlpha0(d, e);

		if(setEmbeddings){
			if(this.isEmbedded(this.vertex)){
				if(d != d0) this.setEmbedding(this.vertex, d, this.cell(this.vertex, d0));
				if(e != e0) this.setEmbedding(this.vertex, e, this.cell(this.vertex, e0));
			}
			if(this.isEmbedded(this.edge)){
				let eid = this.newCell(this.edge);
				this.setEmbedding(this.edge, d, eid);
				this.setEmbedding(this.edge, e, eid);
			}
		}

		return d;
	};
	
	this.disconnectVertices = function(vd0, vd1, setEmbeddings = true){
		let val0 = 0;
		this.foreachDartAlpha1(vd0, d => {if(this.alpha0[d] != vd0) ++val0;});
		let val1 = 0;
		this.foreachDartAlpha1(vd1, d => {if(this.alpha0[d] != vd1) ++val1;});
		this.unsewAlpha0(vd0);

		if(setEmbeddings){
			if(this.isEmbedded(this.edge)){
				let eid = this.cell(this.edge, d0);
				this.deleteCell(this.edge, eid);
			}
		}

		if(val0 > 1) {
				this.unsewAlpha1(vd0);
				this.deleteDart(vd0);
			}
		if(val1 > 1){
				this.unsewAlpha1(vd1);
				this.deleteDart(vd1);
			}
	};

	this.cutEdge = function(ed, setEmbeddings = true){
		let ed0 = ed;
		let ed1 = this.alpha0[ed];

		let vd0 = this.newDart();
		let vd1 = this.newDart();

		this.sewAlpha1(vd0, vd1);
		this.unsewAlpha0(ed0);
		this.sewAlpha0(ed0, vd0);
		this.sewAlpha0(ed1, vd1);

		if(setEmbeddings){
			if(this.isEmbedded(this.vertex)){
				let vid = this.newCell(this.vertex);
				this.setEmbedding(this.vertex, vd0, vid);
				this.setEmbedding(this.vertex, vd1, vid);
			}
			if(this.isEmbedded(this.edge)){
				this.setEmbedding(this.edge, vd0, this.cell(this.edge, ed0));
				let eid = this.newCell(this.edge);
				this.setEmbedding(this.edge, vd1, eid);
				this.setEmbedding(this.edge, ed1, eid);
			}
		}

		return vd0;
	};

	this.collapseEdge = function(ed, setEmbeddings = true){
		let d0 = this.alpha0[ed];
		let d1 = this.alpha1[d0];
		while(d1 != d0){
			let d2 = this.alpha1[d1];
			this.unsewAlpha1(d1);
			this.sewAlpha1(d1, ed);
			d1 = d2;
		}

		if(setEmbeddings){
			if(this.isEmbedded(this.vertex)){
				let eid = this.cell(this.vertex, ed);
				this.foreachDartAlpha1(ed, d => {
					this.setEmbedding(this.vertex, d, eid);
				});
			}
		}
		this.deleteDart(d0);
		this.deleteDart(ed);
	};

	this.mergeEdges = function(vd, setEmbeddings = true){
		if(this.degree(this.vertex, vd) != 2) 
			return;

		let d0 = vd;
		let d1 = this.alpha1[d0];

		let e0 = this.alpha0[d0];
		let e1 = this.alpha0[d1];
		this.unsewAlpha0(d0);
		this.unsewAlpha0(d1);
		this.sewAlpha0(e0, e1);
		
		this.deleteDart(d0);
		this.deleteDart(d1);

		if(setEmbeddings){
			if(this.isEmbedded(this.edge)){
				let eid = this.cell(this.edge, e0);
				this.setEmbedding(this.edge, e1, eid);
			}
		}
	};
}

export default Graph;